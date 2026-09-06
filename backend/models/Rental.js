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
            required: true,
            min: 0,
        },

        securityDeposit: {
            type: Number,
            default: 0,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                'pending',
                'active',
                'completed',
                'cancelled',
            ],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Rental', RentalSchema);