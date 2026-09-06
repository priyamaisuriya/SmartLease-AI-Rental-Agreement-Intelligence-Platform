const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
    getAllPermissions,
    getAllRolePermissions,
    getRolePermissions,
    updateRolePermissions,
    getMyRolePermissions
} = require('../controllers/permissionController');


// ============================================================
// GET ALL AVAILABLE PERMISSIONS
// GET /api/permissions
// ADMIN ONLY
// ============================================================

router.get(
    '/',
    auth,
    adminOnly,
    getAllPermissions
);


// ============================================================
// GET ALL ROLE PERMISSIONS
// GET /api/permissions/roles
// ADMIN ONLY
// ============================================================

router.get(
    '/roles',
    auth,
    adminOnly,
    getAllRolePermissions
);


// ============================================================
// GET PERMISSIONS FOR ROLE
// GET /api/permissions/role/:role
// ADMIN ONLY
// ============================================================

router.get(
    '/role/:role',
    auth,
    adminOnly,
    getRolePermissions
);


// ============================================================
// UPDATE ROLE PERMISSIONS
// PUT /api/permissions/role/:role
// ADMIN ONLY
// ============================================================

router.put(
    '/role/:role',
    auth,
    adminOnly,
    updateRolePermissions
);


// ============================================================
// GET CURRENT USER ROLE PERMISSIONS
// GET /api/permissions/my-role
// AUTHENTICATED USERS
// ============================================================

router.get(
    '/my-role',
    auth,
    getMyRolePermissions
);


module.exports = router;