const Rental = require('../models/Rental');
const Property = require('../models/Property');
const User = require('../models/User');

const {
    createActivityLog
} = require('../services/activityLogService');


// ============================================================
// BOOK PROPERTY
// ============================================================

const bookProperty = async (req, res) => {
    try {

        const tenant = await User.findById(req.user.id)
            .select('role isActive');

        if (!tenant) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (!tenant.isActive) {
            return res.status(403).json({
                message: 'Your account is inactive'
            });
        }

        if (tenant.role !== 'tenant') {
            return res.status(403).json({
                message: 'Only tenants can book properties'
            });
        }

        const {
            propertyId,
            startDate,
            endDate
        } = req.body;

        if (!propertyId) {
            return res.status(400).json({
                message: 'Property ID is required'
            });
        }

        const property =
            await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        if (property.status !== 'available') {
            return res.status(400).json({
                message: 'Property is no longer available'
            });
        }

        const existingRental =
            await Rental.findOne({
                property: property._id,
                tenant: req.user.id,
                status: {
                    $in: ['pending', 'active']
                }
            });

        if (existingRental) {
            return res.status(400).json({
                message:
                    'You already have an active rental for this property'
            });
        }

        if (startDate && endDate) {

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (
                Number.isNaN(start.getTime()) ||
                Number.isNaN(end.getTime())
            ) {
                return res.status(400).json({
                    message: 'Invalid rental dates'
                });
            }

            if (end <= start) {
                return res.status(400).json({
                    message:
                        'End date must be after start date'
                });
            }
        }

        const lockedProperty =
            await Property.findOneAndUpdate(
                {
                    _id: property._id,
                    status: 'available'
                },
                {
                    $set: {
                        status: 'rented'
                    }
                },
                {
                    new: true
                }
            );

        if (!lockedProperty) {
            return res.status(409).json({
                message:
                    'Property was just booked by another tenant'
            });
        }

        try {

            const rental = await Rental.create({
                property: property._id,
                landlord: property.landlord,
                tenant: req.user.id,
                bookingDate: new Date(),
                startDate: startDate || null,
                endDate: endDate || null,
                monthlyRent: property.monthlyRent,
                securityDeposit:
                    property.securityDeposit,
                status: 'active'
            });

            const populatedRental =
                await Rental.findById(rental._id)
                    .populate('property')
                    .populate(
                        'landlord',
                        'name email phone'
                    )
                    .populate(
                        'tenant',
                        'name email phone'
                    );

            await createActivityLog({
                userId: req.user.id,
                action: 'RENTAL_BOOKED',
                module: 'RENTAL',
                description:
                    `Tenant booked property "${property.title}"`,
                targetType: 'Rental',
                targetId: rental._id,
                metadata: {
                    propertyId: property._id,
                    landlordId: property.landlord,
                    monthlyRent:
                        rental.monthlyRent,
                    startDate:
                        rental.startDate,
                    endDate:
                        rental.endDate
                },
                req,
                status: 'success'
            });

            return res.status(201).json({
                message:
                    'Property booked successfully',
                rental: populatedRental
            });

        } catch (rentalError) {

            await Property.findOneAndUpdate(
                {
                    _id: property._id,
                    status: 'rented'
                },
                {
                    $set: {
                        status: 'available'
                    }
                }
            );

            throw rentalError;
        }

    } catch (err) {

        console.error(
            'Book property error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET TENANT RENTALS
// ============================================================

const getMyRentals = async (req, res) => {
    try {

        const rentals = await Rental.find({
            tenant: req.user.id
        })
            .sort({ createdAt: -1 })
            .populate('property')
            .populate(
                'landlord',
                'name email phone'
            );

        return res.json({
            count: rentals.length,
            rentals
        });

    } catch (err) {

        console.error(
            'Get tenant rentals error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET LANDLORD RENTALS
// ============================================================

const getLandlordRentals = async (req, res) => {
    try {

        const rentals = await Rental.find({
            landlord: req.user.id
        })
            .sort({ createdAt: -1 })
            .populate('property')
            .populate(
                'tenant',
                'name email phone'
            );

        return res.json({
            count: rentals.length,
            rentals
        });

    } catch (err) {

        console.error(
            'Get landlord rentals error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET RENTAL BY ID
// ============================================================

const getRentalById = async (req, res) => {
    try {

        const rental =
            await Rental.findById(req.params.id)
                .populate('property')
                .populate(
                    'landlord',
                    'name email phone'
                )
                .populate(
                    'tenant',
                    'name email phone'
                );

        if (!rental) {
            return res.status(404).json({
                message: 'Rental not found'
            });
        }

        const userId = req.user.id;

        if (
            rental.tenant._id.toString() !== userId &&
            rental.landlord._id.toString() !== userId &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'You do not have access to this rental'
            });
        }

        return res.json(rental);

    } catch (err) {

        console.error(
            'Get rental by ID error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// CANCEL RENTAL
// ============================================================

const cancelRental = async (req, res) => {
    try {

        const rental =
            await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({
                message: 'Rental not found'
            });
        }

        const userId = req.user.id;

        const isTenant =
            rental.tenant.toString() === userId;

        const isLandlord =
            rental.landlord.toString() === userId;

        if (
            !isTenant &&
            !isLandlord &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'You do not have access to this rental'
            });
        }

        if (
            rental.status === 'cancelled' ||
            rental.status === 'completed'
        ) {
            return res.status(400).json({
                message:
                    `Rental is already ${rental.status}`
            });
        }

        rental.status = 'cancelled';

        await rental.save();

        await Property.findOneAndUpdate(
            {
                _id: rental.property,
                status: 'rented'
            },
            {
                $set: {
                    status: 'available'
                }
            }
        );

        await createActivityLog({
            userId: req.user.id,
            action: 'RENTAL_CANCELLED',
            module: 'RENTAL',
            description:
                'Rental was cancelled',
            targetType: 'Rental',
            targetId: rental._id,
            metadata: {
                propertyId: rental.property,
                tenantId: rental.tenant,
                landlordId: rental.landlord,
                cancelledByRole:
                    req.user.role
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Rental cancelled successfully',
            rental
        });

    } catch (err) {

        console.error(
            'Cancel rental error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


module.exports = {
    bookProperty,
    getMyRentals,
    getLandlordRentals,
    getRentalById,
    cancelRental
};

const updateRentalStatus = async (req, res) => { try { const rental = await Rental.findById(req.params.id); if (!rental) return res.status(404).json({ message: 'Rental not found' }); const property = await Property.findById(rental.property); if (!property) return res.status(404).json({ message: 'Property not found' }); if (property.landlord.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' }); const { status } = req.body; if (!['active', 'cancelled', 'completed'].includes(status)) return res.status(400).json({ message: 'Invalid status' }); rental.status = status; await rental.save(); if (status === 'active') { property.status = 'rented'; await property.save(); } else if (status === 'cancelled' || status === 'completed') { if (property.status === 'rented') { property.status = 'available'; await property.save(); } } return res.json({ message: 'Rental status updated', rental }); } catch (err) { res.status(500).json({ message: 'Server error' }); } };
module.exports.updateRentalStatus = updateRentalStatus;