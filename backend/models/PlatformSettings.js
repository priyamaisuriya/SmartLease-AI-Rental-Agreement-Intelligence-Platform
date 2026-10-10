const mongoose = require('mongoose');

// Single-document collection holding admin-editable platform settings.
const PlatformSettingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: 'global',
            unique: true
        },

        siteName: {
            type: String,
            trim: true,
            default: 'SmartLease AI',
            minlength: [2, 'Site name must be at least 2 characters'],
            maxlength: [60, 'Site name cannot exceed 60 characters']
        },

        contactEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
            match: [/^$|^\S+@\S+\.\S+$/, 'Please provide a valid contact email']
        },

        // Applied to newly issued login tokens.
        sessionTimeoutMinutes: {
            type: Number,
            default: 300,
            min: [15, 'Session timeout must be at least 15 minutes'],
            max: [1440, 'Session timeout cannot exceed 1440 minutes (24 hours)']
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', PlatformSettingsSchema);
