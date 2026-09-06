const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const requirePermission = require('../middleware/permissions');

const {
    bookProperty,
    getMyRentals,
    getLandlordRentals,
    getRentalById,
    cancelRental
} = require('../controllers/rentalController');


// ============================================================
// TENANT — BOOK PROPERTY
// ============================================================

router.post(
    '/book',
    auth,
    requirePermission('rental-book'),
    bookProperty
);


// ============================================================
// TENANT — VIEW MY RENTALS
// ============================================================

router.get(
    '/my-rentals',
    auth,
    requirePermission('rental-view'),
    getMyRentals
);


// ============================================================
// LANDLORD — VIEW RENTALS FOR MY PROPERTIES
// ============================================================

router.get(
    '/my-properties',
    auth,
    requirePermission('rental-view'),
    getLandlordRentals
);


// ============================================================
// VIEW SINGLE RENTAL
// ============================================================

router.get(
    '/:id',
    auth,
    requirePermission('rental-view'),
    getRentalById
);


// ============================================================
// CANCEL RENTAL
// ============================================================

router.put(
    '/:id/cancel',
    auth,
    requirePermission('rental-cancel'),
    cancelRental
);


module.exports = router;