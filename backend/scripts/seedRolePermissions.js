require('dotenv').config();

const mongoose = require('mongoose');
const RolePermissions = require('../models/RolePermissions');

const rolePermissions = {
    tenant: [
        'dashboard',

        'property-view',
        'property-search',

        'rental-view',
        'rental-book',
        'rental-cancel',

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

        'rental-view',
        'rental-manage',

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

        for (const [role, permissions] of Object.entries(rolePermissions)) {

            await RolePermissions.findOneAndUpdate(
                { role },
                {
                    $set: {
                        permissions
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            console.log(
                `Permissions updated for role: ${role} `
            );
        }

        console.log('Role permissions seeded successfully');

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {
        console.error(
            'Error seeding role permissions:',
            error
        );

        await mongoose.connection.close();

        process.exit(1);
    }
};


seedRolePermissions();