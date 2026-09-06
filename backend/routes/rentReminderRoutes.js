const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const requirePermission = require('../middleware/permissions');

const {
  createRentReminder,
  getMyReminders,
  getLandlordReminders,
  getReminderById,
  markRentPaid,
  cancelReminder
} = require('../controllers/rentReminderController');


/*
 * Landlord creates reminder
 */
router.post(
  '/',
  auth,
  requirePermission('rent-reminders'),
  createRentReminder
);


/*
 * Tenant reminders
 */
router.get(
  '/my-reminders',
  auth,
  requirePermission('rent-reminders'),
  getMyReminders
);


/*
 * Landlord reminders
 */
router.get(
  '/landlord',
  auth,
  requirePermission('rent-reminders'),
  getLandlordReminders
);


/*
 * Single reminder
 */
router.get(
  '/:id',
  auth,
  requirePermission('rent-reminders'),
  getReminderById
);


/*
 * Mark rent paid
 */
router.put(
  '/:id/pay',
  auth,
  requirePermission('rent-reminders'),
  markRentPaid
);


/*
 * Cancel reminder
 */
router.put(
  '/:id/cancel',
  auth,
  requirePermission('rent-reminders'),
  cancelReminder
);


module.exports = router;
