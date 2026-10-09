const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

// Get user's notifications
router.get('/', getMyNotifications);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Mark specific notification as read
router.patch('/:id/read', markAsRead);

module.exports = router;
