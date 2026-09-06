const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const upload = require('../middleware/upload');

const {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  uploadAvatar
} = require('../controllers/userController');


// Get all users
router.get(
  '/',
  auth,
  adminOnly,
  getUsers
);


// Create user
router.post(
  '/',
  auth,
  adminOnly,
  createUser
);


// Update user
router.put(
  '/:id',
  auth,
  updateUser
);


// Update profile image
router.post(
  '/:id/avatar',
  auth,
  upload.single('profileImage'),
  uploadAvatar
);


// Update user status
router.put(
  '/:id/status',
  auth,
  adminOnly,
  updateUserStatus
);


// Delete user
router.delete(
  '/:id',
  auth,
  adminOnly,
  deleteUser
);


module.exports = router;