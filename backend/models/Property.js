const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
    {
        landlord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

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

        // -----------------------------
        // LOCATION
        // -----------------------------

        address: {
            type: String,
            required: true,
            trim: true,
        },

        landmark: {
            type: String,
            trim: true,
            default: '',
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

        // -----------------------------
        // PROPERTY DETAILS
        // -----------------------------

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

        amenities: {
            type: [String],
            default: [],
        },

        // -----------------------------
        // RENTAL INFORMATION
        // -----------------------------

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

        availableFrom: {
            type: Date,
            default: null,
        },

        // -----------------------------
        // PROPERTY STATUS
        // -----------------------------

        status: {
            type: String,
            enum: [
                'available',
                'rented',
                'inactive',
            ],
            default: 'available',
        },

        // -----------------------------
        // IMAGES
        // -----------------------------

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