const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        rental: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rental',
            required: true
        },

        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true
        },

        tenant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        landlord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [1, 'Amount must be at least 1'],
            max: [10000000, 'Amount cannot exceed 10,000,000']
        },

        currency: {
            type: String,
            default: 'INR'
        },

        paymentType: {
            type: String,
            enum: [
                'initial_rent_and_deposit'
            ],
            default: 'initial_rent_and_deposit'
        },

        transactionId: {
            type: String,
            unique: true,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: [
                'created',
                'pending',
                'paid',
                'failed'
            ],
            default: 'created'
        },

        paymentMethod: {
            type: String,
            enum: [
                'mock_card',
                'mock_upi',
                'mock_netbanking'
            ],
            default: 'mock_card'
        },

        paidAt: {
            type: Date,
            default: null
        },

        // =====================================================
        // INVOICE DETAILS
        // =====================================================

        invoiceNumber: {
            type: String,
            unique: true,
            sparse: true,
            default: null
        },

        invoicePath: {
            type: String,
            default: null
        },

        invoiceGeneratedAt: {
            type: Date,
            default: null
        },

        invoiceEmailSentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    'Payment',
    paymentSchema
);