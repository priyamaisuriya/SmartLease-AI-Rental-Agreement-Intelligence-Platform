const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getPlatformSettings,
  updatePlatformSettings
} = require('../controllers/adminSettingsController');

router.get('/', auth, adminOnly, getPlatformSettings);
router.put('/', auth, adminOnly, updatePlatformSettings);

module.exports = router;
