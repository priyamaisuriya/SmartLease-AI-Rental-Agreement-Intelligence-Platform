const mongoose = require('mongoose');

const AgreementSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },

        rental: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rental',
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

        title: {
            type: String,
            required: true,
            trim: true,
        },

        originalFileName: {
            type: String,
            required: true,
        },

        fileUrl: {
            type: String,
            required: true,
        },

        fileType: {
            type: String,
            enum: ['pdf', 'doc', 'docx'],
            required: true,
        },

        status: {
            type: String,
            enum: ['active', 'expired', 'terminated'],
            default: 'active',
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },

        extractedText: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Agreement', AgreementSchema);