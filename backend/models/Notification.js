const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['rental_request', 'rental_update', 'agreement_update', 'payment_update', 'system', 'reminder'],
            default: 'system',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
        relatedEntityModel: {
            type: String,
            enum: ['Rental', 'Agreement', 'Payment', 'Property', 'RentReminder'],
        },
        relatedEntityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', NotificationSchema);
