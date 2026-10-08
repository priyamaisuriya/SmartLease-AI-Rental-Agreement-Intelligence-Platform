const mongoose = require('mongoose');

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
        },

        endDate: {
            type: Date,
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
            enum: [
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
            ],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Rental', RentalSchema);