const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getActivityLogs,
  getActivityLogStats,
  getActivityLogById
} = require('../controllers/activityLogController');

router.get(
  '/stats',
  auth,
  adminOnly,
  getActivityLogStats
);

router.get(
  '/',
  auth,
  adminOnly,
  getActivityLogs
);

router.get(
  '/:id',
  auth,
  adminOnly,
  getActivityLogById
);

module.exports = router;
