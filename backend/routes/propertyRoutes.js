const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const requirePermission = require('../middleware/permissions');

const {
    createProperty,
    getMyProperties,
    getAvailableProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require('../controllers/propertyController');


// ============================================================
// LANDLORD — CREATE PROPERTY
// ============================================================

router.post(
    '/',
    auth,
    requirePermission('property-create'),
    createProperty
);


// ============================================================
// LANDLORD — MY PROPERTIES
// ============================================================

router.get(
    '/my-properties',
    auth,
    requirePermission('property-view'),
    getMyProperties
);


// ============================================================
// TENANT — SEARCH AVAILABLE PROPERTIES
// ============================================================

router.get(
    '/',
    auth,
    requirePermission('property-search'),
    getAvailableProperties
);


// ============================================================
// VIEW PROPERTY
// ============================================================

router.get(
    '/:id',
    auth,
    requirePermission('property-view'),
    getPropertyById
);


// ============================================================
// LANDLORD — UPDATE OWN PROPERTY
// ============================================================

router.put(
    '/:id',
    auth,
    requirePermission('property-update'),
    updateProperty
);


// ============================================================
// LANDLORD — DEACTIVATE OWN PROPERTY
// ============================================================

router.delete(
    '/:id',
    auth,
    requirePermission('property-delete'),
    deleteProperty
);


module.exports = router;