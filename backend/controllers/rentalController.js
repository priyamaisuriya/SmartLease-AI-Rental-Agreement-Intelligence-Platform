const Rental = require('../models/Rental');
const Property = require('../models/Property');
const User = require('../models/User');

const {
    createActivityLog
} = require('../services/activityLogService');


// ============================================================
// BOOK / REQUEST PROPERTY
// ============================================================

const bookProperty = async (req, res) => {
    try {

        // ------------------------------------------------------
        // CHECK TENANT
        // ------------------------------------------------------

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
                message: 'Only tenants can request properties'
            });
        }


        // ------------------------------------------------------
        // REQUEST DATA
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // FIND PROPERTY
        // ------------------------------------------------------

        const property = await Property.findById(propertyId);

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


        // ------------------------------------------------------
        // CHECK EXISTING REQUEST
        // ------------------------------------------------------

        const existingRental = await Rental.findOne({
            property: property._id,
            tenant: req.user.id,
            status: {
                $in: ['pending', 'active']
            }
        });

        if (existingRental) {
            return res.status(400).json({
                message:
                    existingRental.status === 'pending'
                        ? 'You already have a pending request for this property'
                        : 'You already have an active rental for this property'
            });
        }


        // ------------------------------------------------------
        // VALIDATE DATES
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // CREATE PENDING REQUEST
        // ------------------------------------------------------

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

            // IMPORTANT:
            // Request is pending until landlord accepts it.
            status: 'pending'
        });


        // ------------------------------------------------------
        // POPULATE RESPONSE
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // ACTIVITY LOG
        // ------------------------------------------------------

        await createActivityLog({

            userId: req.user.id,

            action: 'RENTAL_REQUESTED',

            module: 'RENTAL',

            description:
                `Tenant requested property "${property.title}"`,

            targetType: 'Rental',

            targetId: rental._id,

            metadata: {

                propertyId:
                    property._id,

                landlordId:
                    property.landlord,

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


        // ------------------------------------------------------
        // RESPONSE
        // ------------------------------------------------------

        return res.status(201).json({

            message:
                'Rental request sent successfully',

            rental: populatedRental
        });


    } catch (err) {

        console.error(
            'Book/request property error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET TENANT RENTALS / REQUESTS
// ============================================================

const getMyRentals = async (req, res) => {

    try {

        const rentals =
            await Rental.find({
                tenant: req.user.id
            })

                .sort({
                    createdAt: -1
                })

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
// GET LANDLORD RENTALS / REQUESTS
// ============================================================

const getLandlordRentals = async (req, res) => {

    try {

        const rentals =
            await Rental.find({
                landlord: req.user.id
            })

                .sort({
                    createdAt: -1
                })

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
            await Rental.findById(
                req.params.id
            )

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


        // ------------------------------------------------------
        // ACCESS CHECK
        // ------------------------------------------------------

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
            await Rental.findById(
                req.params.id
            );


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


        // ------------------------------------------------------
        // MAKE PROPERTY AVAILABLE AGAIN
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // ACTIVITY LOG
        // ------------------------------------------------------

        await createActivityLog({

            userId: req.user.id,

            action: 'RENTAL_CANCELLED',

            module: 'RENTAL',

            description:
                'Rental was cancelled',

            targetType: 'Rental',

            targetId: rental._id,

            metadata: {

                propertyId:
                    rental.property,

                tenantId:
                    rental.tenant,

                landlordId:
                    rental.landlord,

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


// ============================================================
// UPDATE RENTAL STATUS
// LANDLORD → ACCEPT / REJECT
// ============================================================

const updateRentalStatus = async (req, res) => {

    try {

        // ------------------------------------------------------
        // FIND RENTAL
        // ------------------------------------------------------

        const rental =
            await Rental.findById(
                req.params.id
            );


        if (!rental) {

            return res.status(404).json({
                message: 'Rental request not found'
            });
        }


        // ------------------------------------------------------
        // FIND PROPERTY
        // ------------------------------------------------------

        const property =
            await Property.findById(
                rental.property
            );


        if (!property) {

            return res.status(404).json({
                message: 'Property not found'
            });
        }


        // ------------------------------------------------------
        // CHECK LANDLORD
        // ------------------------------------------------------

        if (
            property.landlord.toString() !==
            req.user.id
        ) {

            return res.status(403).json({
                message:
                    'Only the property landlord can update this request'
            });
        }


        // ------------------------------------------------------
        // GET NEW STATUS
        // ------------------------------------------------------

        const { status } = req.body;


        if (
            ![
                'active',
                'cancelled',
                'completed'
            ].includes(status)
        ) {

            return res.status(400).json({
                message:
                    'Invalid status'
            });
        }


        // ======================================================
        // ACCEPT REQUEST
        // ======================================================

        if (status === 'active') {

            // --------------------------------------------------
            // Request must be pending
            // --------------------------------------------------

            if (rental.status !== 'pending') {

                return res.status(400).json({
                    message:
                        `This request is already ${rental.status}`
                });
            }


            // --------------------------------------------------
            // Property must still be available
            // --------------------------------------------------

            if (
                property.status !==
                'available'
            ) {

                return res.status(400).json({
                    message:
                        'This property is no longer available'
                });
            }


            // --------------------------------------------------
            // Mark rental as active
            // --------------------------------------------------

            rental.status = 'active';

            await rental.save();


            // --------------------------------------------------
            // Mark property as rented
            // --------------------------------------------------

            property.status = 'rented';

            await property.save();


            // --------------------------------------------------
            // Reject other pending requests
            // --------------------------------------------------

            await Rental.updateMany(

                {
                    property: rental.property,

                    _id: {
                        $ne: rental._id
                    },

                    status: 'pending'
                },

                {
                    $set: {
                        status: 'cancelled'
                    }
                }

            );


            // --------------------------------------------------
            // ACTIVITY LOG
            // --------------------------------------------------

            await createActivityLog({

                userId: req.user.id,

                action: 'RENTAL_REQUEST_ACCEPTED',

                module: 'RENTAL',

                description:
                    `Rental request accepted for property "${property.title}"`,

                targetType: 'Rental',

                targetId: rental._id,

                metadata: {

                    propertyId:
                        property._id,

                    tenantId:
                        rental.tenant,

                    landlordId:
                        rental.landlord,

                    monthlyRent:
                        rental.monthlyRent
                },

                req,

                status: 'success'
            });


            return res.json({

                message:
                    'Rental request accepted successfully',

                rental

            });
        }


        // ======================================================
        // REJECT REQUEST
        // ======================================================

        if (status === 'cancelled') {

            // --------------------------------------------------
            // Cannot reject completed rental
            // --------------------------------------------------

            if (
                rental.status ===
                'completed'
            ) {

                return res.status(400).json({
                    message:
                        'Completed rental cannot be rejected'
                });
            }


            rental.status = 'cancelled';

            await rental.save();


            // --------------------------------------------------
            // Activity log
            // --------------------------------------------------

            await createActivityLog({

                userId: req.user.id,

                action: 'RENTAL_REQUEST_REJECTED',

                module: 'RENTAL',

                description:
                    `Rental request rejected for property "${property.title}"`,

                targetType: 'Rental',

                targetId: rental._id,

                metadata: {

                    propertyId:
                        property._id,

                    tenantId:
                        rental.tenant,

                    landlordId:
                        rental.landlord
                },

                req,

                status: 'success'
            });


            return res.json({

                message:
                    'Rental request rejected successfully',

                rental

            });
        }


        // ======================================================
        // COMPLETE RENTAL
        // ======================================================

        if (status === 'completed') {

            if (
                rental.status !==
                'active'
            ) {

                return res.status(400).json({
                    message:
                        'Only active rentals can be completed'
                });
            }


            rental.status =
                'completed';

            await rental.save();


            // --------------------------------------------------
            // Property available again
            // --------------------------------------------------

            if (
                property.status ===
                'rented'
            ) {

                property.status =
                    'available';

                await property.save();
            }


            await createActivityLog({

                userId: req.user.id,

                action: 'RENTAL_COMPLETED',

                module: 'RENTAL',

                description:
                    `Rental completed for property "${property.title}"`,

                targetType: 'Rental',

                targetId: rental._id,

                metadata: {

                    propertyId:
                        property._id,

                    tenantId:
                        rental.tenant,

                    landlordId:
                        rental.landlord
                },

                req,

                status: 'success'
            });


            return res.json({

                message:
                    'Rental completed successfully',

                rental

            });
        }


    } catch (err) {

        console.error(
            'Update rental status error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    bookProperty,

    getMyRentals,

    getLandlordRentals,

    getRentalById,

    cancelRental,

    updateRentalStatus

};