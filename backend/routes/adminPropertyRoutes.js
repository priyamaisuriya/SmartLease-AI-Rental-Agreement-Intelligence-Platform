const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAllProperties,
  getPropertyDetails,
  getPropertyStats
} = require('../controllers/adminPropertyController');

router.get(
  '/stats',
  auth,
  adminOnly,
  getPropertyStats
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

module.exports = router;
