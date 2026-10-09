const mongoose = require('mongoose');

const RENTAL_STATUSES = [
    'pending',
    'accepted',
    'rejected',
    'agreement_pending',
    'agreement_accepted',
    'payment_pending',
    'payment_success',
    'confirmed',
    'active',
    'completed',
    'cancelled',
    'expired'
];

const VALID_TRANSITIONS = {
    'pending': ['accepted', 'rejected', 'cancelled', 'expired'],
    'accepted': ['agreement_pending', 'cancelled'],
    'rejected': [],
    'agreement_pending': ['agreement_accepted', 'cancelled'],
    'agreement_accepted': ['payment_pending', 'payment_success', 'cancelled'],
    'payment_pending': ['payment_success', 'cancelled', 'expired'],
    'payment_success': ['confirmed', 'cancelled'],
    'confirmed': ['active', 'cancelled'],
    'active': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
    'expired': []
};

const RentalSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },

        landlord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        tenant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        bookingDate: {
            type: Date,
            default: Date.now,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function(value) {
                    return this.startDate < value;
                },
                message: 'End date must be after start date'
            }
        },

        monthlyRent: {
            type: Number,
            required: [true, 'Monthly rent is required'],
            min: [1, 'Monthly rent must be greater than 0'],
            max: [10000000, 'Monthly rent cannot exceed 10,000,000']
        },

        securityDeposit: {
            type: Number,
            default: 0,
            min: [0, 'Security deposit cannot be negative'],
            max: [50000000, 'Security deposit cannot exceed 50,000,000'],
        },

        status: {
            type: String,
            enum: RENTAL_STATUSES,
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

RentalSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        // Find previous status from DB or if it's new, it's 'pending'
        // For existing documents, this._original isn't automatically available, but we can check if it's a new document
        if (!this.isNew) {
            // Mongoose doesn't easily provide the previous value in pre-save hooks unless fetched.
            // But we can add a custom method for transitions or let the controller handle it.
            // For now, we will add a check if the controller explicitly sets `previousStatus`
            if (this.previousStatus && VALID_TRANSITIONS[this.previousStatus]) {
                if (!VALID_TRANSITIONS[this.previousStatus].includes(this.status)) {
                    return next(new Error(`Invalid status transition from ${this.previousStatus} to ${this.status}`));
                }
            }
        }
    }
    next();
});

// Helper method to safely transition status
RentalSchema.methods.transitionTo = function(newStatus) {
    if (!VALID_TRANSITIONS[this.status].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }
    this.previousStatus = this.status;
    this.status = newStatus;
};

module.exports = mongoose.model('Rental', RentalSchema);