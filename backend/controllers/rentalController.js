const mongoose = require('mongoose');

const Rental = require('../models/Rental');
const Property = require('../models/Property');
const Agreement = require('../models/Agreement');
const Payment = require('../models/Payment');
const User = require('../models/User');

const {
    createActivityLog
} = require('../services/activityLogService');

const {
    createNotification,
    notifyAdmins
} = require('../services/notificationService');

const {
    parseDateOnly,
    todayUtc,
    monthsBetween,
    overlapFilter
} = require('../utils/dates');

const { VALID_TRANSITIONS } = Rental;

const CONFIRMED = Rental.CONFIRMED_STATUSES;
// Statuses in which the landlord has already committed to a tenant for the dates.
const COMMITTED = [
    'accepted',
    'agreement_pending',
    'agreement_accepted',
    'payment_pending',
    'payment_success',
    'confirmed',
    'active'
];
// Open requests of the same tenant that block a duplicate submission.
const OPEN_FOR_TENANT = ['pending', ...COMMITTED];

const MAX_REJECTION_REASON = 500;

// ------------------------------------------------------------
// helpers
// ------------------------------------------------------------

const safeLog = async (payload) => {
    try {
        await createActivityLog(payload);
    } catch (err) {
        console.error('Activity log failed:', err.message);
    }
};

// Atomically move a rental from one of `fromStatuses` to `to`.
// Returns the updated rental, or null if another request changed it first.
const transition = async (rentalId, fromStatuses, to, extra = {}) => {
    const allowedFrom = fromStatuses.filter(
        (from) => (VALID_TRANSITIONS[from] || []).includes(to)
    );

    if (allowedFrom.length === 0) {
        throw new Error(`Invalid status transition to ${to}`);
    }

    return Rental.findOneAndUpdate(
        { _id: rentalId, status: { $in: allowedFrom } },
        { $set: { status: to, ...extra } },
        { new: true }
    );
};

const findBlockingRental = (rental, statuses) =>
    Rental.findOne({
        property: rental.property,
        _id: { $ne: rental._id },
        status: { $in: statuses },
        ...overlapFilter(rental.startDate, rental.endDate)
    });

// Property is only "rented" while an active rental exists.
const releasePropertyIfIdle = async (propertyId) => {
    const stillActive = await Rental.exists({
        property: propertyId,
        status: 'active'
    });

    if (!stillActive) {
        await Property.updateOne(
            { _id: propertyId, status: 'rented' },
            { $set: { status: 'available' } }
        );
    }
};

const currentAgreement = (rentalId) =>
    Agreement.findOne({ rental: rentalId, status: 'active' }).sort({ version: -1 });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const rejectBadId = (req, res) => {
    if (!isValidId(req.params.id)) {
        res.status(400).json({ message: 'Invalid rental id' });
        return true;
    }
    return false;
};

// The tenant's request can no longer be fulfilled because the dates were taken.
const markConflict = async (rental, message) => {
    const updated = await Rental.findOneAndUpdate(
        {
            _id: rental._id,
            status: { $in: ['accepted', 'agreement_pending', 'agreement_accepted', 'payment_success'] }
        },
        { $set: { status: 'conflict', rejectionReason: message } },
        { new: true }
    );

    if (updated) {
        await createNotification({
            user: rental.tenant,
            title: 'Date Conflict Detected',
            message,
            type: 'rental_update',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        await notifyAdmins({
            title: `Date conflict on rental ${String(rental._id).slice(-6)}`,
            message: 'A request was closed because its dates were booked by another tenant.',
            type: 'rental_update',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        await createNotification({
            user: rental.landlord,
            title: 'Overlapping Request Closed',
            message: 'A request was closed automatically because its dates are no longer available.',
            type: 'rental_update',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });
    }

    return updated;
};

// ============================================================
// BOOK / REQUEST PROPERTY
// ============================================================

const bookProperty = async (req, res) => {
    try {

        const tenant = await User.findById(req.user.id)
            .select('role isActive');

        if (!tenant) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!tenant.isActive) {
            return res.status(403).json({ message: 'Your account is inactive' });
        }

        if (tenant.role !== 'tenant') {
            return res.status(403).json({ message: 'Only tenants can request properties' });
        }

        const { propertyId, startDate, endDate } = req.body;

        if (!propertyId || !isValidId(propertyId)) {
            return res.status(400).json({ message: 'A valid property ID is required' });
        }

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Only 'inactive' is hidden from booking. 'rented' stays bookable for
        // other, non-overlapping date ranges.
        if (property.status === 'inactive') {
            return res.status(400).json({
                message: 'Property is currently unavailable for booking'
            });
        }

        if (String(property.landlord) === String(req.user.id)) {
            return res.status(400).json({ message: 'You cannot rent your own property' });
        }

        // ------------------------------------------------------
        // DATES
        // ------------------------------------------------------

        const start = parseDateOnly(startDate);
        const end = parseDateOnly(endDate);

        if (!start || !end) {
            return res.status(400).json({
                message: 'Start and end dates are required in YYYY-MM-DD format'
            });
        }

        if (end <= start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        if (start < todayUtc()) {
            return res.status(400).json({ message: 'Start date cannot be in the past' });
        }

        if (property.availableFrom) {
            const af = new Date(property.availableFrom);
            const availableDate = new Date(Date.UTC(af.getUTCFullYear(), af.getUTCMonth(), af.getUTCDate()));
            if (start < availableDate) {
                return res.status(400).json({
                    message: 'Start date must be on or after the property availability date'
                });
            }
        }

        const months = monthsBetween(start, end);
        const minDuration = property.minDuration || 1;
        const maxDuration = property.maxDuration || 120;

        if (months < minDuration - 0.1) {
            return res.status(400).json({
                message: `Minimum rental duration is ${minDuration} month(s)`
            });
        }

        if (months > maxDuration + 0.1) {
            return res.status(400).json({
                message: `Maximum rental duration is ${maxDuration} month(s)`
            });
        }

        // ------------------------------------------------------
        // DUPLICATE / CLASH CHECKS
        // ------------------------------------------------------

        const existingRental = await Rental.findOne({
            property: property._id,
            tenant: req.user.id,
            status: { $in: OPEN_FOR_TENANT },
            ...overlapFilter(start, end)
        });

        if (existingRental) {
            return res.status(400).json({
                message: 'You already have an ongoing request or active rental for this property on these dates'
            });
        }

        if (
            property.conditions &&
            property.conditions.trim() !== '' &&
            req.body.acknowledgedConditions !== true
        ) {
            return res.status(400).json({
                message: 'You must acknowledge the property conditions before submitting a request'
            });
        }

        // Multiple pending requests for the same dates are allowed; only a
        // confirmed/active booking makes the dates unavailable.
        const clashingRental = await Rental.findOne({
            property: property._id,
            status: { $in: CONFIRMED },
            ...overlapFilter(start, end)
        });

        if (clashingRental) {
            return res.status(400).json({
                message: 'Property is already booked and confirmed for these dates'
            });
        }

        // ------------------------------------------------------
        // CREATE PENDING REQUEST
        // Price, landlord and tenant always come from trusted data.
        // ------------------------------------------------------

        let rental;
        try {
            rental = await Rental.create({
                property: property._id,
                landlord: property.landlord,
                tenant: req.user.id,
                bookingDate: new Date(),
                startDate: start,
                endDate: end,
                monthlyRent: property.monthlyRent,
                securityDeposit: property.securityDeposit,
                acknowledgedConditions: req.body.acknowledgedConditions === true,
                status: 'pending'
            });
        } catch (createErr) {
            if (createErr && createErr.code === 11000) {
                return res.status(409).json({
                    message: 'This request has already been submitted'
                });
            }
            throw createErr;
        }

        const populatedRental = await Rental.findById(rental._id)
            .populate('property')
            .populate('landlord', 'name email phone')
            .populate('tenant', 'name email phone');

        await safeLog({
            userId: req.user.id,
            action: 'RENTAL_REQUESTED',
            module: 'RENTAL',
            description: `Tenant requested property "${property.title}"`,
            targetType: 'Rental',
            targetId: rental._id,
            metadata: {
                propertyId: property._id,
                landlordId: property.landlord,
                monthlyRent: rental.monthlyRent,
                startDate: rental.startDate,
                endDate: rental.endDate
            },
            req,
            status: 'success'
        });

        await createNotification({
            user: req.user.id,
            title: 'Request Submitted',
            message: `Your rental request for ${property.title} has been submitted.`,
            type: 'rental_request',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        await createNotification({
            user: property.landlord,
            title: 'New Rental Request',
            message: `You have received a new rental request for ${property.title}.`,
            type: 'rental_request',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        return res.status(201).json({
            message: 'Rental request sent successfully',
            rental: populatedRental
        });

    } catch (err) {
        console.error('Book/request property error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// GET TENANT RENTALS / REQUESTS
// ============================================================

const getMyRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ tenant: req.user.id })
            .sort({ createdAt: -1 })
            .populate('property')
            .populate('landlord', 'name email phone');

        return res.json({ count: rentals.length, rentals });
    } catch (err) {
        console.error('Get tenant rentals error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// GET LANDLORD RENTALS / REQUESTS
// ============================================================

const getLandlordRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ landlord: req.user.id })
            .sort({ createdAt: -1 })
            .populate('property')
            .populate('tenant', 'name email phone');

        return res.json({ count: rentals.length, rentals });
    } catch (err) {
        console.error('Get landlord rentals error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// GET RENTAL BY ID
// ============================================================

const getRentalById = async (req, res) => {
    try {
        if (rejectBadId(req, res)) return;

        const rental = await Rental.findById(req.params.id)
            .populate('property')
            .populate('landlord', 'name email phone')
            .populate('tenant', 'name email phone');

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        const userId = req.user.id;

        if (
            String(rental.tenant._id) !== userId &&
            String(rental.landlord._id) !== userId &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'You do not have access to this rental' });
        }

        return res.json(rental);
    } catch (err) {
        console.error('Get rental by ID error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// CANCEL RENTAL
// ============================================================

const performCancel = async (req, res, rental) => {
    const cancellable = Object.keys(VALID_TRANSITIONS)
        .filter((s) => VALID_TRANSITIONS[s].includes('cancelled'));

    if (!cancellable.includes(rental.status)) {
        return res.status(400).json({
            message: `A ${rental.status} rental cannot be cancelled`
        });
    }

    const updated = await transition(rental._id, cancellable, 'cancelled');

    if (!updated) {
        return res.status(409).json({
            message: 'The rental changed while you were cancelling it. Please refresh and try again.'
        });
    }

    await releasePropertyIfIdle(rental.property);

    const cancelledByTenant = String(rental.tenant) === req.user.id;
    const notifyUser = cancelledByTenant ? rental.landlord : rental.tenant;

    await createNotification({
        user: notifyUser,
        title: 'Rental Cancelled',
        message: `A rental request/booking was cancelled by the ${cancelledByTenant ? 'tenant' : 'landlord'}.`,
        type: 'rental_update',
        relatedEntityModel: 'Rental',
        relatedEntityId: rental._id
    });

    await safeLog({
        userId: req.user.id,
        action: 'RENTAL_CANCELLED',
        module: 'RENTAL',
        description: 'Rental was cancelled',
        targetType: 'Rental',
        targetId: rental._id,
        metadata: {
            propertyId: rental.property,
            tenantId: rental.tenant,
            landlordId: rental.landlord,
            cancelledByRole: req.user.role,
            previousStatus: rental.status
        },
        req,
        status: 'success'
    });

    return res.json({ message: 'Rental cancelled successfully', rental: updated });
};

const cancelRental = async (req, res) => {
    try {
        if (rejectBadId(req, res)) return;

        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        const userId = req.user.id;
        const isTenant = String(rental.tenant) === userId;
        const isLandlord = String(rental.landlord) === userId;

        if (!isTenant && !isLandlord && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have access to this rental' });
        }

        return await performCancel(req, res, rental);
    } catch (err) {
        console.error('Cancel rental error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// UPDATE RENTAL STATUS
// LANDLORD → ACCEPT / REJECT / ACTIVATE / COMPLETE / CANCEL
// ============================================================

const updateRentalStatus = async (req, res) => {
    try {
        if (rejectBadId(req, res)) return;

        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        const property = await Property.findById(rental.property);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (String(property.landlord) !== req.user.id) {
            return res.status(403).json({
                message: 'Only the property landlord can update this request'
            });
        }

        const { status } = req.body;

        if (!['accepted', 'active', 'cancelled', 'completed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // ======================================================
        // ACCEPT
        // ======================================================

        if (status === 'accepted') {

            if (rental.status !== 'pending') {
                return res.status(400).json({
                    message: `This request is already ${rental.status}`
                });
            }

            if (rental.startDate < todayUtc()) {
                return res.status(400).json({
                    message: 'The requested start date has already passed'
                });
            }

            // Another confirmed booking, or a request the landlord already
            // accepted, makes these dates unavailable for acceptance.
            const clash = await findBlockingRental(rental, COMMITTED);

            if (clash) {
                const confirmedClash = CONFIRMED.includes(clash.status);
                return res.status(409).json({
                    message: confirmedClash
                        ? 'These dates are already booked and confirmed for another tenant'
                        : 'You have already accepted another request for these dates'
                });
            }

            const updated = await transition(rental._id, ['pending'], 'accepted');

            if (!updated) {
                return res.status(409).json({
                    message: 'This request was changed by someone else. Please refresh.'
                });
            }

            // Verify after writing: if a competing accept/confirm slipped in
            // concurrently, the later of the two (by _id) steps back.
            const raced = await findBlockingRental(updated, COMMITTED);
            if (raced && (CONFIRMED.includes(raced.status) || String(raced._id) < String(updated._id))) {
                await Rental.updateOne(
                    { _id: updated._id, status: 'accepted' },
                    { $set: { status: 'pending' } }
                );
                return res.status(409).json({
                    message: 'These dates were just taken by another request'
                });
            }

            await createNotification({
                user: rental.tenant,
                title: 'Rental Request Accepted',
                message: `Your request for ${property.title} was accepted. The landlord will upload the rental agreement for you to review.`,
                type: 'rental_update',
                relatedEntityModel: 'Rental',
                relatedEntityId: rental._id
            });

            await safeLog({
                userId: req.user.id,
                action: 'RENTAL_REQUEST_ACCEPTED',
                module: 'RENTAL',
                description: `Rental request accepted for property "${property.title}"`,
                targetType: 'Rental',
                targetId: rental._id,
                metadata: {
                    propertyId: property._id,
                    tenantId: rental.tenant,
                    landlordId: rental.landlord,
                    monthlyRent: rental.monthlyRent
                },
                req,
                status: 'success'
            });

            return res.json({
                message: 'Rental request accepted successfully',
                rental: updated
            });
        }

        // ======================================================
        // ACTIVATE (confirmed → active)
        // ======================================================

        if (status === 'active') {

            const updated = await transition(rental._id, ['confirmed'], 'active');

            if (!updated) {
                return res.status(400).json({
                    message: 'Only confirmed rentals can be activated'
                });
            }

            await Property.updateOne(
                { _id: property._id, status: 'available' },
                { $set: { status: 'rented' } }
            );

            await createNotification({
                user: rental.tenant,
                title: 'Rental Activated',
                message: `Your rental of ${property.title} is now active.`,
                type: 'rental_update',
                relatedEntityModel: 'Rental',
                relatedEntityId: rental._id
            });

            await safeLog({
                userId: req.user.id,
                action: 'RENTAL_ACTIVATED',
                module: 'RENTAL',
                description: `Rental activated for property "${property.title}"`,
                targetType: 'Rental',
                targetId: rental._id,
                metadata: {
                    propertyId: property._id,
                    tenantId: rental.tenant,
                    landlordId: rental.landlord
                },
                req,
                status: 'success'
            });

            return res.json({ message: 'Rental activated successfully', rental: updated });
        }

        // ======================================================
        // REJECT
        // ======================================================

        if (status === 'rejected') {

            const reason = typeof req.body.rejectionReason === 'string'
                ? req.body.rejectionReason.trim().slice(0, MAX_REJECTION_REASON)
                : '';

            const updated = await transition(rental._id, ['pending'], 'rejected', {
                rejectionReason: reason
            });

            if (!updated) {
                return res.status(400).json({
                    message: 'Only pending requests can be rejected'
                });
            }

            await createNotification({
                user: rental.tenant,
                title: 'Rental Request Rejected',
                message: `Your request for ${property.title} was rejected.${reason ? ` Reason: ${reason}` : ''} You can choose new dates and submit another request.`,
                type: 'rental_update',
                relatedEntityModel: 'Rental',
                relatedEntityId: rental._id
            });

            await safeLog({
                userId: req.user.id,
                action: 'RENTAL_REQUEST_REJECTED',
                module: 'RENTAL',
                description: `Rental request rejected for property "${property.title}"`,
                targetType: 'Rental',
                targetId: rental._id,
                metadata: {
                    propertyId: property._id,
                    tenantId: rental.tenant,
                    landlordId: rental.landlord
                },
                req,
                status: 'success'
            });

            return res.json({ message: 'Rental request rejected successfully', rental: updated });
        }

        // ======================================================
        // CANCEL
        // ======================================================

        if (status === 'cancelled') {
            return await performCancel(req, res, rental);
        }

        // ======================================================
        // COMPLETE (active → completed)
        // ======================================================

        if (status === 'completed') {

            const updated = await transition(rental._id, ['active'], 'completed');

            if (!updated) {
                return res.status(400).json({
                    message: 'Only active rentals can be completed'
                });
            }

            await releasePropertyIfIdle(property._id);

            await createNotification({
                user: rental.tenant,
                title: 'Rental Completed',
                message: `Your rental of ${property.title} has been marked as completed.`,
                type: 'rental_update',
                relatedEntityModel: 'Rental',
                relatedEntityId: rental._id
            });

            await safeLog({
                userId: req.user.id,
                action: 'RENTAL_COMPLETED',
                module: 'RENTAL',
                description: `Rental completed for property "${property.title}"`,
                targetType: 'Rental',
                targetId: rental._id,
                metadata: {
                    propertyId: property._id,
                    tenantId: rental.tenant,
                    landlordId: rental.landlord
                },
                req,
                status: 'success'
            });

            return res.json({ message: 'Rental completed successfully', rental: updated });
        }

    } catch (err) {
        console.error('Update rental status error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// TENANT ACCEPTS AGREEMENT
// ============================================================

const acceptAgreement = async (req, res) => {
    try {
        if (rejectBadId(req, res)) return;

        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        if (String(rental.tenant) !== req.user.id) {
            return res.status(403).json({
                message: 'Only the tenant can accept the agreement'
            });
        }

        if (rental.status !== 'agreement_pending') {
            return res.status(400).json({
                message: `Cannot accept agreement in ${rental.status} status`
            });
        }

        // The tenant must accept the agreement the landlord actually uploaded.
        const agreement = await currentAgreement(rental._id);

        if (!agreement) {
            return res.status(400).json({
                message: 'No rental agreement has been uploaded yet'
            });
        }

        // If the client states which version it reviewed, it must be the current one.
        if (
            req.body &&
            req.body.version !== undefined &&
            Number(req.body.version) !== agreement.version
        ) {
            return res.status(409).json({
                message: 'A newer version of the agreement is available. Please review it before accepting.'
            });
        }

        const clash = await findBlockingRental(rental, CONFIRMED);
        if (clash) {
            await markConflict(rental, 'This property was just booked by another tenant for the same dates.');
            return res.status(409).json({
                message: 'This property was just booked by another tenant for the same dates.'
            });
        }

        const updated = await transition(rental._id, ['agreement_pending'], 'agreement_accepted', {
            acceptedAgreement: agreement._id,
            acceptedAgreementVersion: agreement.version,
            agreementAcceptedAt: new Date()
        });

        if (!updated) {
            return res.status(409).json({
                message: 'The agreement was updated or the request changed. Please refresh.'
            });
        }

        agreement.acceptedAt = new Date();
        agreement.acceptedBy = req.user.id;
        await agreement.save();

        await createNotification({
            user: rental.landlord,
            title: 'Agreement Accepted',
            message: 'The tenant has accepted the rental agreement. They can now proceed to payment.',
            type: 'agreement_update',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        await safeLog({
            userId: req.user.id,
            action: 'AGREEMENT_ACCEPTED',
            module: 'RENTAL',
            description: 'Tenant accepted the rental agreement',
            targetType: 'Rental',
            targetId: rental._id,
            metadata: {
                rentalId: rental._id,
                agreementId: agreement._id,
                agreementVersion: agreement.version
            },
            req,
            status: 'success'
        });

        return res.json({ message: 'Agreement accepted successfully', rental: updated });

    } catch (err) {
        console.error('Accept agreement error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ============================================================
// TENANT CONFIRMS BOOKING
// Requires: landlord acceptance → current agreement accepted →
// verified successful payment → dates still available.
// ============================================================

const confirmBooking = async (req, res) => {
    try {
        if (rejectBadId(req, res)) return;

        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        if (String(rental.tenant) !== req.user.id) {
            return res.status(403).json({
                message: 'Only the tenant can confirm the booking'
            });
        }

        // Idempotent: a repeated click on an already-confirmed booking is not an error.
        if (CONFIRMED.includes(rental.status)) {
            return res.json({ message: 'Booking is already confirmed', rental });
        }

        if (rental.status !== 'payment_success') {
            return res.status(400).json({
                message: `Cannot confirm booking in ${rental.status} status`
            });
        }

        const property = await Property.findById(rental.property);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // ------------------------------------------------------
        // VERIFY AGREEMENT (current version accepted)
        // ------------------------------------------------------

        const agreement = await currentAgreement(rental._id);

        if (
            !agreement ||
            !rental.acceptedAgreementVersion ||
            rental.acceptedAgreementVersion !== agreement.version
        ) {
            return res.status(400).json({
                message: 'The current version of the agreement has not been accepted'
            });
        }

        // ------------------------------------------------------
        // VERIFY PAYMENT (server-side record, never client input)
        // ------------------------------------------------------

        const expectedAmount =
            Number(rental.monthlyRent || 0) + Number(rental.securityDeposit || 0);

        const payment = await Payment.findOne({
            rental: rental._id,
            tenant: rental.tenant,
            paymentStatus: 'paid'
        });

        if (!payment || payment.amount !== expectedAmount) {
            return res.status(400).json({
                message: 'A verified successful payment is required before confirming the booking'
            });
        }

        // ------------------------------------------------------
        // RECHECK AVAILABILITY
        // ------------------------------------------------------

        const clash = await findBlockingRental(rental, CONFIRMED);

        if (clash) {
            await markConflict(
                rental,
                'This property was just confirmed by another tenant for the same dates.'
            );

            return res.status(409).json({
                message:
                    'Unfortunately, this property was just confirmed by another tenant for the same dates. Please choose different dates.'
            });
        }

        // ------------------------------------------------------
        // CONFIRM (atomic claim, then verify no concurrent winner)
        // ------------------------------------------------------

        const confirmedAt = new Date();

        const updated = await transition(rental._id, ['payment_success'], 'confirmed', {
            confirmedAt
        });

        if (!updated) {
            return res.status(409).json({
                message: 'The booking changed while confirming. Please refresh.'
            });
        }

        const rival = await findBlockingRental(updated, CONFIRMED);

        if (
            rival &&
            (
                (rival.confirmedAt && rival.confirmedAt < confirmedAt) ||
                (
                    (!rival.confirmedAt || +rival.confirmedAt === +confirmedAt) &&
                    String(rival._id) < String(updated._id)
                )
            )
        ) {
            // Lost a simultaneous confirmation: step back, then close as a conflict
            // (which also notifies both parties).
            await Rental.updateOne(
                { _id: updated._id, status: 'confirmed' },
                { $set: { status: 'payment_success', confirmedAt: null } }
            );

            await markConflict(
                updated,
                'This property was just confirmed by another tenant for the same dates.'
            );

            return res.status(409).json({
                message:
                    'Unfortunately, this property was just confirmed by another tenant for the same dates. Please choose different dates.'
            });
        }

        // ------------------------------------------------------
        // CLOSE OTHER OVERLAPPING REQUESTS
        // ------------------------------------------------------

        const others = await Rental.find({
            property: rental.property,
            _id: { $ne: rental._id },
            status: { $in: Rental.IN_PROGRESS_STATUSES },
            ...overlapFilter(rental.startDate, rental.endDate)
        }).select('_id tenant landlord status paymentVerifiedAt');

        for (const other of others) {
            const closed = await Rental.findOneAndUpdate(
                { _id: other._id, status: other.status },
                {
                    $set: {
                        status: other.status === 'payment_success' ? 'conflict' : 'cancelled',
                        rejectionReason: 'Dates were booked by another tenant.'
                    }
                },
                { new: true }
            );

            if (closed) {
                await createNotification({
                    user: other.tenant,
                    title: 'Request No Longer Available',
                    message: `Your request for ${property.title} was closed because the dates were booked by another tenant.${' You can choose new dates and submit another request.'}`,
                    type: 'rental_update',
                    relatedEntityModel: 'Rental',
                    relatedEntityId: other._id
                });
            }
        }

        await createNotification({
            user: rental.tenant,
            title: 'Booking Confirmed',
            message: `Your booking for ${property.title} is confirmed. Your invoice is now available.`,
            type: 'rental_update',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        await createNotification({
            user: rental.landlord,
            title: 'Booking Confirmed',
            message: `A booking for ${property.title} has been confirmed.`,
            type: 'rental_update',
            relatedEntityModel: 'Rental',
            relatedEntityId: rental._id
        });

        await safeLog({
            userId: req.user.id,
            action: 'BOOKING_CONFIRMED',
            module: 'RENTAL',
            description: 'Tenant confirmed the booking',
            targetType: 'Rental',
            targetId: rental._id,
            metadata: {
                rentalId: rental._id,
                propertyId: rental.property,
                paymentId: payment._id
            },
            req,
            status: 'success'
        });

        return res.json({ message: 'Booking confirmed successfully', rental: updated });

    } catch (err) {
        console.error('Confirm booking error:', err);
        return res.status(500).json({ message: 'Server error' });
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
    updateRentalStatus,
    acceptAgreement,
    confirmBooking
};
