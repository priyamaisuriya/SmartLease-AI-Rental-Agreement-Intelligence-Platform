const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    /*
     * Public registration should NOT allow someone
     * to create an admin or property_manager account.
     *
     * Allowed public roles:
     * - tenant
     * - landlord
     *
     * If no valid role is supplied, default to tenant.
     */
    const publicRole =
      role === 'landlord'
        ? 'landlord'
        : 'tenant';

    user = new User({
      name,
      email,
      password,
      role: publicRole,
      phone: phone || ''
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: 'Failed to create authentication token'
          });
        }

        res.json({
          token,
          role: user.role
        });
      }
    );

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({
      message: 'Server error'
    });
  }
});


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid Credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid Credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: 'Failed to create authentication token'
          });
        }

        res.json({
          token,
          role: user.role
        });
      }
    );

  } catch (err) {
    console.error('Login error:', err.message);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// @route   GET api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User
      .findById(req.user.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(user);

  } catch (err) {
    console.error('Auth/me error:', err.message);

    res.status(500).json({
      message: 'Server Error'
    });
  }
});


module.exports = router;