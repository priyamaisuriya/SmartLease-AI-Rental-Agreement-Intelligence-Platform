const User = require('../models/User');
const RolePermission = require('../models/RolePermissions');


// ============================================================
// AVAILABLE PERMISSIONS
// ============================================================

const ALL_PERMISSIONS = [
    'dashboard',

    'property-view',
    'property-create',
    'property-update',
    'property-delete',
    'property-search',

    'agreement-history',
    'agreement-view',
    'agreement-upload',

    'agreement-analysis',
    'agreement-summary',
    'clause-explanation',
    'risk-detection',

    'rent-reminders',

    'tenant-management',
    'landlord-management',

    'reports',
    'feedback',

    'profile',
    'settings',

    'permission-management',

    'rental-view',
    'rental-book',
    'rental-manage',
    'rental-cancel',
];


// ============================================================
// AVAILABLE ROLES
// ============================================================

const ROLES = [
    'tenant',
    'landlord',
    'admin'
];


// ============================================================
// GET ALL AVAILABLE PERMISSIONS
// GET /api/permissions
// ADMIN ONLY
// ============================================================

const getAllPermissions = async (req, res) => {

    try {

        return res.json(ALL_PERMISSIONS);

    } catch (err) {

        console.error(
            'Get permissions error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET ALL ROLE PERMISSIONS
// GET /api/permissions/roles
// ADMIN ONLY
// ============================================================

const getAllRolePermissions = async (req, res) => {

    try {

        const rolePermissions =
            await RolePermission.find()
                .sort({ role: 1 });

        return res.json(rolePermissions);

    } catch (err) {

        console.error(
            'Get role permissions error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET PERMISSIONS FOR A ROLE
// GET /api/permissions/role/:role
// ADMIN ONLY
// ============================================================

const getRolePermissions = async (req, res) => {

    try {

        const { role } = req.params;


        if (!ROLES.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role'
            });
        }


        let rolePermission =
            await RolePermission.findOne({
                role
            });


        // Create empty permission record if missing
        if (!rolePermission) {

            rolePermission =
                await RolePermission.create({
                    role,
                    permissions: []
                });
        }


        return res.json(rolePermission);

    } catch (err) {

        console.error(
            'Get role permissions error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// UPDATE PERMISSIONS FOR A ROLE
// PUT /api/permissions/role/:role
// ADMIN ONLY
// ============================================================

const updateRolePermissions = async (req, res) => {

    try {

        const { role } = req.params;
        const { permissions } = req.body;


        // Validate role
        if (!ROLES.includes(role)) {

            return res.status(400).json({
                message: 'Invalid role'
            });
        }


        // Validate permissions array
        if (!Array.isArray(permissions)) {

            return res.status(400).json({
                message:
                    'Permissions must be an array'
            });
        }


        // Find invalid permissions
        const invalidPermissions =
            permissions.filter(
                permission =>
                    !ALL_PERMISSIONS.includes(permission)
            );


        if (invalidPermissions.length > 0) {

            return res.status(400).json({
                message: 'Invalid permissions',
                invalidPermissions
            });
        }


        // Admin always has full access
        if (role === 'admin') {

            return res.json({
                message: 'Admin has full access',
                role: 'admin',
                permissions: ALL_PERMISSIONS
            });
        }


        // Update role permissions
        const rolePermission =
            await RolePermission.findOneAndUpdate(
                { role },
                {
                    $set: {
                        permissions
                    }
                },
                {
                    new: true,
                    upsert: true
                }
            );


        return res.json({
            message:
                'Role permissions updated successfully',
            rolePermission
        });

    } catch (err) {

        console.error(
            'Update role permissions error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET LOGGED-IN USER'S ROLE PERMISSIONS
// GET /api/permissions/my-role
// AUTHENTICATED USERS
// ============================================================

const getMyRolePermissions = async (req, res) => {

    try {

        const user =
            await User.findById(req.user.id)
                .select('role isActive');


        if (!user) {

            return res.status(404).json({
                message: 'User not found'
            });
        }


        if (!user.isActive) {

            return res.status(403).json({
                message:
                    'Your account is inactive'
            });
        }


        // Admin gets everything
        if (user.role === 'admin') {

            return res.json({
                role: 'admin',
                permissions: ALL_PERMISSIONS
            });
        }


        const rolePermission =
            await RolePermission.findOne({
                role: user.role
            });


        if (!rolePermission) {

            return res.json({
                role: user.role,
                permissions: []
            });
        }


        return res.json({
            role: user.role,
            permissions:
                rolePermission.permissions
        });

    } catch (err) {

        console.error(
            'My role permissions error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


module.exports = {
    ALL_PERMISSIONS,
    ROLES,
    getAllPermissions,
    getAllRolePermissions,
    getRolePermissions,
    updateRolePermissions,
    getMyRolePermissions
};