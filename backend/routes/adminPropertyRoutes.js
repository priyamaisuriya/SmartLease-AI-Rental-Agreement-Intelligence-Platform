const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAllProperties,
  getPropertyDetails,
  getPropertyStats,
  updatePropertyStatus
} = require('../controllers/adminPropertyController');

router.get(
  '/stats',
  auth,
  adminOnly,
  getPropertyStats,
  updatePropertyStatus
);

router.get(
  '/',
  auth,
  adminOnly,
  getAllProperties
);

router.get(
  '/:id',
  auth,
  adminOnly,
  getPropertyDetails
);

router.patch(
  '/:id/status',
  auth,
  adminOnly,
  updatePropertyStatus
);

module.exports = router;
