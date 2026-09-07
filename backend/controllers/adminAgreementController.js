const mongoose = require('mongoose');

const Agreement = require('../models/Agreement');
const AgreementAnalysis = require('../models/AgreementAnalysis');


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
            filter.status = status;
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
                .skip(skip)
                .limit(currentLimit),

            Agreement.countDocuments(filter)
        ]);

        return res.json({
            agreements,
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

        agreement.status = 'terminated';

        await agreement.save();

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

        // Also delete associated analyses
        await AgreementAnalysis.deleteMany({ agreement: id });

        await agreement.deleteOne();

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
