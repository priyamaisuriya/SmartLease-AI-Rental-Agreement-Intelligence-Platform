const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAdminDashboard
} = require('../controllers/adminDashboardController');

router.get(
  '/',
  auth,
  adminOnly,
  getAdminDashboard
);

module.exports = router;
