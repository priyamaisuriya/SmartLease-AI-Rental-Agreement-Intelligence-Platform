const path = require('path');

const Agreement = require('../models/Agreement');
const Rental = require('../models/Rental');
const Property = require('../models/Property');

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
                message: 'Only landlords can upload agreements'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Please upload an agreement file'
            });
        }

        const {
            rentalId,
            title
        } = req.body;

        if (!rentalId) {
            return res.status(400).json({
                message: 'rentalId is required'
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: 'Agreement title is required'
            });
        }

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
                message:
                    'You can only upload agreements for your own rentals'
            });
        }

        if (
            rental.status === 'cancelled' ||
            rental.status === 'completed'
        ) {
            return res.status(400).json({
                message:
                    'Agreement cannot be uploaded for this rental'
            });
        }

        const property = await Property.findById(
            rental.property
        );

        if (!property) {
            return res.status(404).json({
                message: 'Related property not found'
            });
        }

        const extension = path
            .extname(req.file.originalname)
            .toLowerCase()
            .replace('.', '');

        let extractedText = '';

        try {
            const filePath = path.join(
                __dirname,
                '../uploads/agreements',
                req.file.filename
            );

            extractedText = await extractDocumentText(
                filePath,
                extension
            );

            console.log(
                `Agreement text extracted successfully. Characters: ${extractedText.length}`
            );

        } catch (extractionError) {
            console.error(
                'Document text extraction error:',
                extractionError.message
            );
        }

        const agreement = new Agreement({
            property: rental.property,
            rental: rental._id,
            landlord: rental.landlord,
            tenant: rental.tenant,

            title: title.trim(),

            originalFileName: req.file.originalname,

            fileUrl:
                `/uploads/agreements/${req.file.filename}`,

            fileType: extension,

            status: 'active',

            uploadedAt: new Date(),

            extractedText
        });

        await agreement.save();

        // =====================================================
        // ACTIVITY LOG
        // =====================================================

        await createActivityLog({
            userId: req.user.id,
            action: 'AGREEMENT_UPLOADED',
            module: 'agreement',
            description:
                `Agreement "${agreement.title}" was uploaded`,
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

        const populatedAgreement =
            await Agreement.findById(
                agreement._id
            )
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
                );

        return res.status(201).json({
            message:
                'Agreement uploaded successfully',
            agreement: populatedAgreement
        });

    } catch (err) {
        console.error(
            'Upload agreement error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
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


module.exports = {
    uploadAgreement,
    getMyAgreements,
    getAgreementById,
    updateAgreement,
    terminateAgreement
};