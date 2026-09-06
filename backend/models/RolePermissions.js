const mongoose = require('mongoose');

const RolePermissionSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['tenant', 'landlord', 'admin'],
            required: true,
            unique: true,
        },

        permissions: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('RolePermission', RolePermissionSchema);