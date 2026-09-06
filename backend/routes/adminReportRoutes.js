const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
    getOverviewReport,
    getUserReport,
    getPropertyReport,
    getRentalReport,
    getAgreementReport,
    getAIReport,
    getReminderReport,
    getMonthlyReport
} = require('../controllers/adminReportController');


// Overall platform report
router.get(
    '/overview',
    auth,
    adminOnly,
    getOverviewReport
);


// User report
router.get(
    '/users',
    auth,
    adminOnly,
    getUserReport
);


// Property report
router.get(
    '/properties',
    auth,
    adminOnly,
    getPropertyReport
);


// Rental report
router.get(
    '/rentals',
    auth,
    adminOnly,
    getRentalReport
);


// Agreement report
router.get(
    '/agreements',
    auth,
    adminOnly,
    getAgreementReport
);


// AI report
router.get(
    '/ai',
    auth,
    adminOnly,
    getAIReport
);


// Rent reminder report
router.get(
    '/reminders',
    auth,
    adminOnly,
    getReminderReport
);


// Monthly report
router.get(
    '/monthly',
    auth,
    adminOnly,
    getMonthlyReport
);


module.exports = router;
