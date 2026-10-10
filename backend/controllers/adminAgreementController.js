const mongoose = require('mongoose');

const Agreement = require('../models/Agreement');
const AgreementAnalysis = require('../models/AgreementAnalysis');
const Rental = require('../models/Rental');

const path = require('path');

const { createActivityLog } = require('../services/activityLogService');
const { removeFile } = require('../utils/fileSignature');
const { escapeRegex } = require('../utils/dates');

const AGREEMENT_STATUSES = ['draft', 'active', 'expired', 'terminated'];

// Once payment has started the agreement is part of the booking record.
const LOCKED_RENTAL_STATUSES = [
    'payment_pending',
    'payment_success',
    'confirmed',
    'active',
    'completed'
];

const isLockedByRental = (agreement) =>
    agreement.rental
        ? Rental.exists({ _id: agreement.rental, status: { $in: LOCKED_RENTAL_STATUSES } })
        : null;

const logAdminAction = async (req, action, description, agreement) => {
    try {
        await createActivityLog({
            userId: req.user.id,
            action,
            module: 'agreement',
            description,
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: { rentalId: agreement.rental, status: agreement.status },
            req,
            status: 'success'
        });
    } catch (e) {
        console.error('Activity log failed:', e.message);
    }
};


// =====================================================
// GET ALL AGREEMENTS
// GET /api/admin/agreements
// =====================================================

const getAllAgreements = async (req, res) => {
    try {
        const {
            status,
            landlordId,
            tenantId,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const currentPage = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const currentLimit = Math.min(
            Math.max(parseInt(limit, 10) || 20, 1),
            100
        );

        const filter = {};

        if (status) {
            if (!AGREEMENT_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid status filter'
                });
            }

            filter.status = status;
        }

        if (typeof search === 'string' && search.trim()) {
            const re = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');
            filter.$or = [{ title: re }, { originalFileName: re }];
        }

        if (landlordId) {
            if (!mongoose.Types.ObjectId.isValid(landlordId)) {
                return res.status(400).json({
                    message: 'Invalid landlordId'
                });
            }

            filter.landlord = landlordId;
        }

        if (tenantId) {
            if (!mongoose.Types.ObjectId.isValid(tenantId)) {
                return res.status(400).json({
                    message: 'Invalid tenantId'
                });
            }

            filter.tenant = tenantId;
        }

        const skip =
            (currentPage - 1) * currentLimit;

        const [
            agreements,
            total
        ] = await Promise.all([
            Agreement.find(filter)
                .populate(
                    'landlord',
                    'name email phone'
                )
                .populate(
                    'tenant',
                    'name email phone'
                )
                .populate(
                    'property',
                    'title address city state monthlyRent status'
                )
                .populate(
                    'rental',
                    'bookingDate startDate endDate monthlyRent status'
                )
                .sort({
                    createdAt: -1
                })
                .select('-extractedText')
                .skip(skip)
                .limit(currentLimit),

            Agreement.countDocuments(filter)
        ]);

        // Real AI analysis counts per agreement on this page (by analysis type).
        const analysisRows = agreements.length
            ? await AgreementAnalysis.aggregate([
                { $match: { agreement: { $in: agreements.map((a) => a._id) } } },
                { $group: { _id: { agreement: '$agreement', type: '$type' }, count: { $sum: 1 } } }
            ])
            : [];

        const analysisByAgreement = {};
        analysisRows.forEach((row) => {
            const key = String(row._id.agreement);
            analysisByAgreement[key] = analysisByAgreement[key] || {};
            analysisByAgreement[key][row._id.type] = row.count;
        });

        const agreementsWithAnalyses = agreements.map((a) => ({
            ...a.toObject(),
            analyses: analysisByAgreement[String(a._id)] || {}
        }));

        return res.json({
            agreements: agreementsWithAnalyses,
            pagination: {
                page: currentPage,
                limit: currentLimit,
                total,
                totalPages: Math.ceil(
                    total / currentLimit
                )
            }
        });

    } catch (err) {
        console.error(
            'Get all agreements error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// GET AGREEMENT DETAILS
// GET /api/admin/agreements/:id
// =====================================================

const getAgreementDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid agreement ID'
            });
        }

        const agreement =
            await Agreement.findById(id)
                .populate(
                    'landlord',
                    'name email phone profileImage'
                )
                .populate(
                    'tenant',
                    'name email phone profileImage'
                )
                .populate(
                    'property',
                    'title description propertyType address city state pincode bedrooms bathrooms area furnishing monthlyRent securityDeposit status images'
                )
                .populate(
                    'rental',
                    'bookingDate startDate endDate monthlyRent securityDeposit status'
                );

        if (!agreement) {
            return res.status(404).json({
                message: 'Agreement not found'
            });
        }

        const analysisCount =
            await AgreementAnalysis.countDocuments({
                agreement: id
            });

        return res.json({
            agreement,
            analysisCount
        });

    } catch (err) {
        console.error(
            'Get agreement details error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// AGREEMENT STATISTICS
// GET /api/admin/agreements/stats
// =====================================================

const getAgreementStats = async (req, res) => {
    try {
        const [
            total,
            active,
            expired,
            terminated
        ] = await Promise.all([
            Agreement.countDocuments(),

            Agreement.countDocuments({
                status: 'active'
            }),

            Agreement.countDocuments({
                status: 'expired'
            }),

            Agreement.countDocuments({
                status: 'terminated'
            })
        ]);

        const fileTypeStats =
            await Agreement.aggregate([
                {
                    $group: {
                        _id: '$fileType',
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

        return res.json({
            total,
            active,
            expired,
            terminated,

            fileTypes: fileTypeStats.map(
                item => ({
                    fileType: item._id,
                    count: item.count
                })
            )
        });

    } catch (err) {
        console.error(
            'Agreement stats error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// TERMINATE AGREEMENT
// PUT /api/admin/agreements/:id/terminate
// =====================================================

const terminateAgreement = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid agreement ID'
            });
        }

        const agreement =
            await Agreement.findById(id);

        if (!agreement) {
            return res.status(404).json({
                message: 'Agreement not found'
            });
        }

        if (agreement.status === 'terminated') {
            return res.status(400).json({
                message: 'Agreement is already terminated'
            });
        }

        if (await isLockedByRental(agreement)) {
            return res.status(400).json({
                message: 'This agreement belongs to a rental that is already in payment or booked and cannot be terminated'
            });
        }

        agreement.status = 'terminated';

        await agreement.save();

        await logAdminAction(
            req,
            'ADMIN_AGREEMENT_TERMINATED',
            `Admin terminated agreement "${agreement.title}"`,
            agreement
        );

        return res.json({
            message: 'Agreement terminated successfully',
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
// DELETE AGREEMENT
// DELETE /api/admin/agreements/:id
// =====================================================

const deleteAgreement = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid agreement ID'
            });
        }

        const agreement = await Agreement.findById(id);

        if (!agreement) {
            return res.status(404).json({
                message: 'Agreement not found'
            });
        }

        if (await isLockedByRental(agreement)) {
            return res.status(400).json({
                message: 'This agreement belongs to a rental that is already in payment or booked and cannot be deleted'
            });
        }

        // Also delete associated analyses
        await AgreementAnalysis.deleteMany({ agreement: id });

        const storedFile = agreement.fileUrl
            ? path.join(__dirname, '../uploads/agreements', path.basename(agreement.fileUrl))
            : null;

        await agreement.deleteOne();

        if (storedFile) {
            removeFile(storedFile);
        }

        await logAdminAction(
            req,
            'ADMIN_AGREEMENT_DELETED',
            `Admin deleted agreement "${agreement.title}"`,
            agreement
        );

        return res.json({
            message: 'Agreement deleted successfully'
        });

    } catch (err) {
        console.error(
            'Delete agreement error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};

module.exports = {
    getAllAgreements,
    getAgreementDetails,
    getAgreementStats,
    terminateAgreement,
    deleteAgreement
};
