const fs = require('fs');
const path = require('path');

const Agreement = require('../models/Agreement');
const Rental = require('../models/Rental');
const Property = require('../models/Property');
const {
    createNotification
} = require('../services/notificationService');

const {
    detectDocumentType,
    removeFile
} = require('../utils/fileSignature');

const UPLOADABLE_STATUSES = [
    'accepted',
    'agreement_pending',
    'agreement_accepted'
];

// Once the tenant has moved on to payment the agreement is locked in.
const LOCKED_RENTAL_STATUSES = [
    'payment_pending',
    'payment_success',
    'confirmed',
    'active',
    'completed'
];

const {
    extractDocumentText
} = require('../services/documentService');

const {
    createActivityLog
} = require('../services/activityLogService');


// =====================================================
// UPLOAD AGREEMENT
// Landlord uploads an agreement for one of their rentals
// =====================================================


const uploadAgreement = async (req, res) => {
    try {
        // Never keep an uploaded file when the request ends in an error.
        res.on('finish', () => {
            if (res.statusCode >= 400 && req.file && req.file.path) {
                removeFile(req.file.path);
            }
        });

        // 1. Authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        // 2. Authorization
        if (
            req.user.role !== 'landlord' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Only landlords can upload agreements'
            });
        }

        // 3. Validate file
        if (!req.file) {
            return res.status(400).json({
                message: 'Please upload an agreement file'
            });
        }

        const { rentalId, title } = req.body;

        if (!rentalId) {
            return res.status(400).json({
                message: 'rentalId is required'
            });
        }

        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                message: 'Agreement title is required'
            });
        }

        // 4. Find rental
        console.log('[UPLOAD] Finding rental');

        const rental = await Rental.findById(rentalId);

        if (!rental) {
            return res.status(404).json({
                message: 'Rental not found'
            });
        }

        if (
            req.user.role !== 'admin' &&
            rental.landlord.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: 'You can only upload agreements for your own rentals'
            });
        }

        // Agreements can only be uploaded after the landlord accepted the request,
        // and only until the tenant has moved on to payment.
        if (
            !UPLOADABLE_STATUSES.includes(rental.status)
        ) {
            removeFile(req.file.path);
            return res.status(400).json({
                message:
                    rental.status === 'pending'
                        ? 'Accept the rental request before uploading an agreement'
                        : `Agreement cannot be uploaded while the rental is ${rental.status}`
            });
        }

        // 5. Find property
        const property = await Property.findById(rental.property);

        if (!property) {
            removeFile(req.file.path);
            return res.status(404).json({
                message: 'Related property not found'
            });
        }

        // 6. Validate real file type, then extract document text
        const extension = detectDocumentType(req.file.path);

        if (!extension) {
            removeFile(req.file.path);
            return res.status(400).json({
                message: 'The uploaded file is not a valid PDF, DOC or DOCX document'
            });
        }

        let extractedText = '';

        try {
            const filePath = path.join(
                __dirname,
                '../uploads/agreements',
                req.file.filename
            );

            console.log('[UPLOAD] Extracting document text');

            extractedText = await extractDocumentText(
                filePath,
                extension
            );

            console.log(
                '[UPLOAD] Extraction completed:',
                extractedText.length,
                'characters'
            );
        } catch (extractionError) {
            console.error(
                '[UPLOAD] Document extraction failed:',
                extractionError.stack || extractionError
            );
        }

        // 7. Determine agreement version
        console.log('[UPLOAD] Checking existing agreements');

        const existingAgreement = await Agreement.findOne({
            rental: rental._id
        }).sort({ version: -1 });

        const nextVersion = existingAgreement
            ? (existingAgreement.version || 1) + 1
            : 1;

        // 8. Create agreement
        const agreement = new Agreement({
            property: rental.property,
            rental: rental._id,
            landlord: rental.landlord,
            tenant: rental.tenant,
            title: title.trim(),
            originalFileName: req.file.originalname,
            fileUrl: `/uploads/agreements/${req.file.filename}`,
            fileType: extension,
            status: 'active',
            version: nextVersion,
            uploadedAt: new Date(),
            extractedText
        });

        console.log('[UPLOAD] Saving agreement');

        await agreement.save();

        console.log('[UPLOAD] Agreement saved:', agreement._id.toString());

        // 9. Terminate previous active agreements after successful save
        if (existingAgreement) {
            await Agreement.updateMany(
                {
                    rental: rental._id,
                    _id: { $ne: agreement._id },
                    status: 'active'
                },
                {
                    $set: { status: 'terminated' }
                }
            );
        }

        // 10. Update rental status. A new version always needs a fresh acceptance.
        await Rental.findOneAndUpdate(
            { _id: rental._id, status: { $in: UPLOADABLE_STATUSES } },
            {
                $set: {
                    status: 'agreement_pending',
                    acceptedAgreement: null,
                    acceptedAgreementVersion: null,
                    agreementAcceptedAt: null
                }
            }
        );

        // 11. Notify tenant
        try {
            await createNotification({
                user: rental.tenant,
                type: 'agreement_update',
                title: `Rental Agreement v${nextVersion} Uploaded`,
                message: `Landlord has uploaded ${nextVersion > 1 ? 'an updated' : 'a'
                    } rental agreement for your request. Please review and accept it.`,
                relatedEntityModel: 'Agreement',
                relatedEntityId: agreement._id
            });

            console.log('[UPLOAD] Tenant notification created');
        } catch (notifErr) {
            console.error(
                '[UPLOAD] Notification creation failed:',
                notifErr.stack || notifErr
            );
        }

        // 12. Create activity log
        try {
            console.log('[UPLOAD] Creating activity log');

            await createActivityLog({
                userId: req.user.id,
                action: 'AGREEMENT_UPLOADED',
                module: 'agreement',
                description: `Agreement "${agreement.title}" was uploaded`,
                targetType: 'Agreement',
                targetId: agreement._id,
                metadata: {
                    rentalId: rental._id,
                    propertyId: rental.property,
                    tenantId: rental.tenant,
                    landlordId: rental.landlord,
                    fileType: extension,
                    originalFileName: req.file.originalname
                },
                req,
                status: 'success'
            });

            console.log('[UPLOAD] Activity log completed');
        } catch (activityError) {
            console.error(
                '[UPLOAD] Activity log failed:',
                activityError.stack || activityError
            );
        }

        // 13. Return populated agreement
        console.log('[UPLOAD] Populating agreement');

        const populatedAgreement = await Agreement.findById(
            agreement._id
        )
            .populate('property', 'title address city state')
            .populate('landlord', 'name email phone')
            .populate('tenant', 'name email phone')
            .populate(
                'rental',
                'monthlyRent securityDeposit startDate endDate status'
            );

        console.log('[UPLOAD] Upload completed successfully');

        return res.status(201).json({
            message: 'Agreement uploaded successfully',
            agreement: populatedAgreement
        });

    } catch (err) {
        console.error('[UPLOAD] FATAL ERROR:', err);
        console.error('[UPLOAD] STACK TRACE:', err.stack);

        return res.status(500).json({
            message: 'Failed to upload agreement',
            error: err.message
        });
    }
};


// =====================================================
// GET MY AGREEMENTS
// Tenant → own agreements
// Landlord → their agreements
// Admin → all agreements
// =====================================================

const getMyAgreements = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        let filter = {};

        if (req.user.role === 'tenant') {
            filter.tenant = req.user.id;
        } else if (req.user.role === 'landlord') {
            filter.landlord = req.user.id;
        } else if (req.user.role === 'admin') {
            filter = {};
        } else {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        const agreements =
            await Agreement.find(filter)
                .populate(
                    'property',
                    'title address city state'
                )
                .populate(
                    'landlord',
                    'name email phone'
                )
                .populate(
                    'tenant',
                    'name email phone'
                )
                .populate(
                    'rental',
                    'monthlyRent securityDeposit startDate endDate status'
                )
                .sort({
                    createdAt: -1
                });

        return res.json({
            count: agreements.length,
            agreements
        });

    } catch (err) {
        console.error(
            'Get agreements error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// GET AGREEMENT BY ID
// Only involved tenant, landlord, or admin can view
// =====================================================

const getAgreementById = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const agreement =
            await Agreement.findById(
                req.params.id
            )
                .populate(
                    'property',
                    'title description address city state pincode'
                )
                .populate(
                    'landlord',
                    'name email phone'
                )
                .populate(
                    'tenant',
                    'name email phone'
                )
                .populate(
                    'rental',
                    'monthlyRent securityDeposit startDate endDate status bookingDate'
                );

        if (!agreement) {
            return res.status(404).json({
                message: 'Agreement not found'
            });
        }

        const isAdmin =
            req.user.role === 'admin';

        const isLandlord =
            agreement.landlord._id.toString() ===
            req.user.id;

        const isTenant =
            Boolean(agreement.tenant) &&
            agreement.tenant._id.toString() ===
            req.user.id;

        if (
            !isAdmin &&
            !isLandlord &&
            !isTenant
        ) {
            return res.status(403).json({
                message:
                    'You are not authorized to view this agreement'
            });
        }

        return res.json({
            agreement
        });

    } catch (err) {
        console.error(
            'Get agreement error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// UPDATE AGREEMENT
// Landlord can update title/status
// =====================================================

const updateAgreement = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        if (
            req.user.role !== 'landlord' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'Only landlords can update agreements'
            });
        }

        const agreement =
            await Agreement.findById(
                req.params.id
            );

        if (!agreement) {
            return res.status(404).json({
                message: 'Agreement not found'
            });
        }

        if (
            req.user.role !== 'admin' &&
            agreement.landlord.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message:
                    'You can only update your own agreements'
            });
        }

        const {
            title,
            status
        } = req.body;

        if (status !== undefined && status !== agreement.status) {
            const lockedRental = await Rental.exists({
                _id: agreement.rental,
                status: { $in: LOCKED_RENTAL_STATUSES }
            });

            if (lockedRental) {
                return res.status(400).json({
                    message: 'The agreement status cannot be changed once the tenant has started payment'
                });
            }
        }

        const oldTitle = agreement.title;
        const oldStatus = agreement.status;

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message:
                        'Agreement title cannot be empty'
                });
            }

            agreement.title = title.trim();
        }

        if (status !== undefined) {
            const allowedStatuses = [
                'active',
                'expired',
                'terminated'
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message:
                        'Invalid agreement status'
                });
            }

            agreement.status = status;
        }

        await agreement.save();

        await createActivityLog({
            userId: req.user.id,
            action: 'AGREEMENT_UPDATED',
            module: 'agreement',
            description:
                `Agreement "${agreement.title}" was updated`,
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: {
                oldTitle,
                newTitle: agreement.title,
                oldStatus,
                newStatus: agreement.status
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Agreement updated successfully',
            agreement
        });

    } catch (err) {
        console.error(
            'Update agreement error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// TERMINATE AGREEMENT
// Keeps record for history
// =====================================================

const terminateAgreement = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        if (
            req.user.role !== 'landlord' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'Only landlords can terminate agreements'
            });
        }

        const agreement =
            await Agreement.findById(
                req.params.id
            );

        if (!agreement) {
            return res.status(404).json({
                message: 'Agreement not found'
            });
        }

        if (
            req.user.role !== 'admin' &&
            agreement.landlord.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message:
                    'You can only terminate your own agreements'
            });
        }

        if (agreement.status === 'terminated') {
            return res.status(400).json({
                message:
                    'Agreement is already terminated'
            });
        }

        const lockedRental = await Rental.exists({
            _id: agreement.rental,
            status: { $in: LOCKED_RENTAL_STATUSES }
        });

        if (lockedRental) {
            return res.status(400).json({
                message: 'The agreement cannot be terminated once the tenant has started payment'
            });
        }

        const previousStatus =
            agreement.status;

        agreement.status = 'terminated';

        await agreement.save();

        await createActivityLog({
            userId: req.user.id,
            action: 'AGREEMENT_TERMINATED',
            module: 'agreement',
            description:
                `Agreement "${agreement.title}" was terminated`,
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: {
                previousStatus,
                newStatus: 'terminated',
                rentalId: agreement.rental,
                propertyId: agreement.property,
                tenantId: agreement.tenant,
                landlordId: agreement.landlord
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Agreement terminated successfully',
            agreement
        });

    } catch (err) {
        console.error(
            'Terminate agreement error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// DOWNLOAD AGREEMENT
// =====================================================

const downloadAgreement = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        const isAdmin = req.user.role === 'admin';
        const isLandlord = agreement.landlord.toString() === req.user.id;
        const isTenant = agreement.tenant && agreement.tenant.toString() === req.user.id;

        if (!isAdmin && !isLandlord && !isTenant) {
            return res.status(403).json({ message: 'You are not authorized to view this agreement' });
        }

        // fileUrl is something like /uploads/agreements/filename.pdf
        const filePath = path.join(
            __dirname,
            '../uploads/agreements',
            path.basename(agreement.fileUrl)
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        return res.download(filePath, agreement.originalFileName);
    } catch (err) {
        console.error('Download agreement error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    uploadAgreement,
    getMyAgreements,
    getAgreementById,
    updateAgreement,
    terminateAgreement,
    downloadAgreement
};