const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAllRentReminders,
  getRentReminderDetails,
  getRentReminderStats
} = require('../controllers/adminRentReminderController');

router.get(
  '/stats',
  auth,
  adminOnly,
  getRentReminderStats
);

router.get(
  '/',
  auth,
  adminOnly,
  getAllRentReminders
);

router.get(
  '/:id',
  auth,
  adminOnly,
  getRentReminderDetails
);

module.exports = router;
