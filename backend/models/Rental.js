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
    'expired',
    'conflict'
];

const VALID_TRANSITIONS = {
    'pending': ['accepted', 'rejected', 'cancelled', 'expired'],
    'accepted': ['agreement_pending', 'cancelled', 'conflict'],
    'rejected': [],
    'agreement_pending': ['agreement_accepted', 'cancelled', 'conflict'],
    'agreement_accepted': ['agreement_pending', 'payment_pending', 'payment_success', 'cancelled', 'conflict'],
    'payment_pending': ['payment_success', 'cancelled', 'expired'],
    'payment_success': ['confirmed', 'cancelled', 'conflict'],
    'confirmed': ['active', 'cancelled'],
    'active': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
    'expired': [],
    'conflict': ['cancelled']
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
                validator: function (value) {
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

        acknowledgedConditions: {
            type: Boolean,
            default: false
        },

        rejectionReason: {
            type: String,
            default: ''
        },

        // Agreement version the tenant accepted. Payment is only allowed
        // while this matches the landlord's current active agreement.
        acceptedAgreement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement',
            default: null
        },

        acceptedAgreementVersion: {
            type: Number,
            default: null
        },

        agreementAcceptedAt: {
            type: Date,
            default: null
        },

        paymentVerifiedAt: {
            type: Date,
            default: null
        },

        confirmedAt: {
            type: Date,
            default: null
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

// Remember the persisted status so every save is validated against it,
// not only saves where a caller remembered to set previousStatus.
RentalSchema.post('init', function (doc) {
    doc._originalStatus = doc.status;
});

RentalSchema.pre('save', function () {
    if (this.isNew || !this.isModified('status')) {
        return;
    }

    const from = this._originalStatus;
    const to = this.status;

    if (!from || from === to) {
        return;
    }

    if (!(VALID_TRANSITIONS[from] || []).includes(to)) {
        throw new Error(`Invalid status transition from ${from} to ${to}`);
    }
});

RentalSchema.post('save', function (doc) {
    doc._originalStatus = doc.status;
});

// Helper method to safely transition status
RentalSchema.methods.transitionTo = function (newStatus) {
    if (!(VALID_TRANSITIONS[this.status] || []).includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;
};

// Statuses in which a rental holds, or competes for, the property's dates.
RentalSchema.statics.CONFIRMED_STATUSES = ['confirmed', 'active'];
RentalSchema.statics.IN_PROGRESS_STATUSES = [
    'pending', 'accepted', 'agreement_pending', 'agreement_accepted',
    'payment_pending', 'payment_success'
];
RentalSchema.statics.VALID_TRANSITIONS = VALID_TRANSITIONS;

RentalSchema.index({ property: 1, status: 1, startDate: 1, endDate: 1 });
// Blocks an identical duplicate submission (double click / retry) for the same
// tenant, property and dates while the earlier request is still open.
RentalSchema.index(
    { property: 1, tenant: 1, startDate: 1, endDate: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $in: [
                    'pending', 'accepted', 'agreement_pending', 'agreement_accepted',
                    'payment_pending', 'payment_success', 'confirmed', 'active'
                ]
            }
        }
    }
);
RentalSchema.index({ tenant: 1, createdAt: -1 });
RentalSchema.index({ landlord: 1, createdAt: -1 });

module.exports = mongoose.model('Rental', RentalSchema);
