const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAllRentals,
  getRentalDetails,
  getRentalStats
} = require('../controllers/adminRentalController');

router.get(
  '/stats',
  auth,
  adminOnly,
  getRentalStats
);

router.get(
  '/',
  auth,
  adminOnly,
  getAllRentals
);

router.get(
  '/:id',
  auth,
  adminOnly,
  getRentalDetails
);

module.exports = router;
