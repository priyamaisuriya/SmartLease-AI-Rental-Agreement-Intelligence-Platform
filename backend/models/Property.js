const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
    {
        // Landlord who owns the property
        landlord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Basic information
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: '',
        },

        propertyType: {
            type: String,
            enum: [
                'apartment',
                'house',
                'villa',
                'room',
                'studio',
                'office',
                'shop',
                'other',
            ],
            required: true,
        },

        // Location
        address: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            trim: true,
            default: '',
        },

        // Property details
        bedrooms: {
            type: Number,
            min: 0,
            default: 0,
        },

        bathrooms: {
            type: Number,
            min: 0,
            default: 0,
        },

        area: {
            type: Number,
            min: 0,
            default: 0,
        },

        furnishing: {
            type: String,
            enum: [
                'furnished',
                'semi_furnished',
                'unfurnished',
            ],
            default: 'unfurnished',
        },

        // Rental information
        monthlyRent: {
            type: Number,
            required: true,
            min: 0,
        },

        securityDeposit: {
            type: Number,
            min: 0,
            default: 0,
        },

        // Property availability
        status: {
            type: String,
            enum: [
                'available',
                'rented',
                'inactive',
            ],
            default: 'available',
        },

        // Property images
        images: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Property', PropertySchema);