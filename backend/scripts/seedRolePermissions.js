require('dotenv').config();

const mongoose = require('mongoose');
const RolePermissions = require('../models/RolePermissions');

const rolePermissions = {
    tenant: [
        'dashboard',
        'property-view',
        'property-search',
        'agreement-history',
        'agreement-view',
        'agreement-analysis',
        'agreement-summary',
        'clause-explanation',
        'risk-detection',
        'rent-reminders',
        'profile',
        'feedback'
    ],

    landlord: [
        'dashboard',
        'property-view',
        'property-create',
        'property-update',
        'property-delete',
        'agreement-history',
        'agreement-view',
        'agreement-upload',
        'agreement-analysis',
        'agreement-summary',
        'clause-explanation',
        'risk-detection',
        'rent-reminders',
        'tenant-management',
        'reports',
        'feedback',
        'profile'
    ],

    admin: []
};


const seedRolePermissions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected');

        for (const roleData of rolePermissions) {
            await RolePermissions.findOneAndUpdate(
                { role: roleData.role },
                {
                    $set: {
                        permissions: roleData.permissions
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            console.log(
                `Permissions updated for role: ${roleData.role}`
            );
        }

        console.log('Role permissions seeded successfully');

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {
        console.error('Error seeding role permissions:', error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedRolePermissions();