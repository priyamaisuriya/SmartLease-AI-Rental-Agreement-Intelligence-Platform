const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const {
  getAIUsage,
  getAIUsageStats
} = require('../controllers/aiUsageController');


/*
 * AI usage statistics
 *
 * GET /api/ai-usage/stats
 */
router.get(
  '/stats',
  auth,
  adminOnly,
  getAIUsageStats
);


/*
 * AI usage records
 *
 * GET /api/ai-usage
 */
router.get(
  '/',
  auth,
  adminOnly,
  getAIUsage
);


module.exports = router;
