const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAllAgreements,
  getAgreementDetails,
  getAgreementStats,
  terminateAgreement
} = require('../controllers/adminAgreementController');

router.get(
  '/stats',
  auth,
  adminOnly,
  getAgreementStats
);

router.get(
  '/',
  auth,
  adminOnly,
  getAllAgreements
);

router.get(
  '/:id',
  auth,
  adminOnly,
  getAgreementDetails
);

router.put(
  '/:id/terminate',
  auth,
  adminOnly,
  terminateAgreement
);

module.exports = router;
