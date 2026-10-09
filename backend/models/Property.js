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
            required: [true, 'Property title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters']
        },

        description: {
            type: String,
            trim: true,
            default: '',
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },

        propertyType: {
            type: String,
            enum: [
                'apartment',
                'house',
                'villa',
                'studio',
                'office',
                'shop',
                'land',
                'other',
            ],
            required: true,
        },

        customPropertyType: {
            type: String,
            trim: true,
            default: '',
        },

        // -----------------------------
        // LOCATION
        // -----------------------------

        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
            minlength: [5, 'Address must be at least 5 characters'],
            maxlength: [200, 'Address cannot exceed 200 characters']
        },

        landmark: {
            type: String,
            trim: true,
            default: '',
            maxlength: [100, 'Landmark cannot exceed 100 characters']
        },

        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
            maxlength: [50, 'City cannot exceed 50 characters']
        },

        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
            maxlength: [50, 'State cannot exceed 50 characters']
        },

        pincode: {
            type: String,
            trim: true,
            default: '',
            match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
        },

        // -----------------------------
        // PROPERTY DETAILS
        // -----------------------------

        bedrooms: {
            type: Number,
            min: [0, 'Bedrooms cannot be negative'],
            max: [20, 'Bedrooms cannot exceed 20'],
            default: 0,
        },

        bathrooms: {
            type: Number,
            min: [0, 'Bathrooms cannot be negative'],
            max: [20, 'Bathrooms cannot exceed 20'],
            default: 0,
        },

        area: {
            type: Number,
            min: [0, 'Area cannot be negative'],
            max: [1000000, 'Area cannot exceed 1,000,000 sq.ft'],
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
            required: [true, 'Monthly rent is required'],
            min: [1, 'Monthly rent must be greater than 0'],
            max: [10000000, 'Monthly rent cannot exceed 10,000,000']
        },

        securityDeposit: {
            type: Number,
            min: [0, 'Security deposit cannot be negative'],
            max: [50000000, 'Security deposit cannot exceed 50,000,000'],
            default: 0,
        },

        availableFrom: {
            type: Date,
            default: null,
        },

        minDuration: {
            type: Number,
            min: [1, 'Minimum duration must be at least 1 month'],
            default: 1
        },

        maxDuration: {
            type: Number,
            min: [1, 'Maximum duration must be at least 1 month'],
            default: 120
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

        draftAgreement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement',
            default: null
        },

        conditions: {
            type: String,
            default: '',
            trim: true,
            maxlength: [5000, 'Conditions cannot exceed 5000 characters']
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Property', PropertySchema);