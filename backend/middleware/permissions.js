const User = require('../models/User');
const RolePermission = require('../models/RolePermissions');

const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }

            const user = await User.findById(req.user.id)
                .select('role isActive');

            if (!user) {
                return res.status(401).json({
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    message: 'Your account is inactive'
                });
            }

            // Admin always has full access
            if (user.role === 'admin') {
                return next();
            }

            // Get permissions assigned to the user's ROLE
            const rolePermission = await RolePermission.findOne({
                role: user.role
            }).select('permissions');

            if (!rolePermission) {
                return res.status(403).json({
                    message: 'No permissions configured for this role'
                });
            }

            if (!rolePermission.permissions.includes(permission)) {
                return res.status(403).json({
                    message: `Permission denied: ${permission}`
                });
            }

            next();

        } catch (err) {
            console.error('Permission middleware error:', err.message);

            return res.status(500).json({
                message: 'Server error'
            });
        }
    };
};

module.exports = requirePermission;