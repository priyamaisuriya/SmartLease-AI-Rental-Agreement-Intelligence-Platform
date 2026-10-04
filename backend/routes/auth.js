const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const auth = require('../middleware/auth');

const {
  sendVerificationOTP,
} = require('../services/emailService');


// ============================================================
// CREATE JWT TOKEN
// ============================================================

const createToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secret123',
    {
      expiresIn: '5h',
    }
  );
};


// ============================================================
// SEND REGISTRATION OTP
// POST /api/auth/send-otp
// PUBLIC
// ============================================================

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message:
          'Please enter a valid email address',
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          'An account with this email already exists.',
      });
    }

    // Generate 6 digit OTP
    const otp =
      crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before saving
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // OTP valid for 5 minutes
    const expiresAt =
      new Date(Date.now() + 5 * 60 * 1000);

    // Delete old OTP
    await EmailVerification.deleteOne({
      email: normalizedEmail,
    });

    // Save new OTP
    await EmailVerification.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Send OTP email
    await sendVerificationOTP(
      normalizedEmail,
      otp
    );

    return res.status(200).json({
      message:
        'Verification OTP has been sent to your email address.',
    });
  } catch (err) {
    console.error(
      'Send OTP error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Unable to send verification OTP. Please try again.',
    });
  }
});


// ============================================================
// VERIFY REGISTRATION OTP
// POST /api/auth/verify-otp
// PUBLIC
// ============================================================

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          'Email and OTP are required',
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message:
          'OTP must be exactly 6 digits',
      });
    }

    const verification =
      await EmailVerification.findOne({
        email: normalizedEmail,
      });

    if (!verification) {
      return res.status(400).json({
        message:
          'OTP not found. Please request a new OTP.',
      });
    }

    // Check expiry
    if (
      verification.expiresAt < new Date()
    ) {
      await EmailVerification.deleteOne({
        email: normalizedEmail,
      });

      return res.status(400).json({
        message:
          'OTP has expired. Please request a new OTP.',
      });
    }

    // Check attempts
    if (verification.attempts >= 5) {
      await EmailVerification.deleteOne({
        email: normalizedEmail,
      });

      return res.status(400).json({
        message:
          'Too many incorrect attempts. Please request a new OTP.',
      });
    }

    // Hash entered OTP
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Compare OTP
    if (
      otpHash !== verification.otpHash
    ) {
      verification.attempts += 1;

      await verification.save();

      return res.status(400).json({
        message:
          'Invalid OTP. Please check the code and try again.',
      });
    }

    // Mark OTP verified
    verification.verified = true;
    verification.verifiedAt = new Date();

    await verification.save();

    return res.status(200).json({
      message:
        'Email verified successfully.',
      verified: true,
    });
  } catch (err) {
    console.error(
      'Verify OTP error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Unable to verify OTP. Please try again.',
    });
  }
});


// ============================================================
// REGISTER
// POST /api/auth/register
// PUBLIC
// ============================================================

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'tenant',
    } = req.body;

    // Required fields
    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Name, email and password are required.',
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message:
          'Please enter a valid email address.',
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          'An account with this email already exists.',
      });
    }

    // Check email verification
    const verification =
      await EmailVerification.findOne({
        email: normalizedEmail,
        verified: true,
      });

    if (!verification) {
      return res.status(400).json({
        message:
          'Please verify your email using OTP before registering.',
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long.',
      });
    }

    // Validate role
    if (
      !['tenant', 'landlord'].includes(role)
    ) {
      return res.status(400).json({
        message:
          'Invalid role selected.',
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      emailVerified: true,
    });

    // Delete verification record
    await EmailVerification.deleteOne({
      email: normalizedEmail,
    });

    // Create JWT
    const token = createToken(user);

    return res.status(201).json({
      message:
        'Registration successful.',
      token,
      role: user.role,
    });
  } catch (err) {
    console.error(
      'Register error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Registration failed. Please try again.',
    });
  }
});


// ============================================================
// SEND LOGIN OTP
// POST /api/auth/login/send-otp
// PUBLIC
// ============================================================

router.post(
  '/login/send-otp',
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      // Required fields
      if (!email || !password) {
        return res.status(400).json({
          message:
            'Email and password are required',
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      // Email validation
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message:
            'Please enter a valid email address',
        });
      }

      // Find user
      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        return res.status(400).json({
          message: 'Invalid Credentials',
        });
      }

      // Check active account
      if (!user.isActive) {
        return res.status(403).json({
          message:
            'Your account has been deactivated. Please contact the administrator.',
        });
      }

      // Check password
      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid Credentials',
        });
      }

      // Generate 6 digit login OTP
      const otp =
        crypto.randomInt(
          100000,
          1000000
        ).toString();

      // Hash OTP
      const otpHash = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

      // OTP expires in 5 minutes
      const expiresAt =
        new Date(
          Date.now() + 5 * 60 * 1000
        );

      // Remove previous OTP
      await EmailVerification.deleteOne({
        email: normalizedEmail,
      });

      // Save login OTP
      await EmailVerification.create({
        email: normalizedEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
      });

      // Send OTP
      await sendVerificationOTP(
        normalizedEmail,
        otp
      );

      return res.status(200).json({
        message:
          'Login OTP has been sent to your email address.',
      });
    } catch (err) {
      console.error(
        'Login Send OTP error:',
        err.message
      );

      return res.status(500).json({
        message:
          'Unable to send login OTP. Please try again.',
      });
    }
  }
);


// ============================================================
// VERIFY LOGIN OTP
// POST /api/auth/login/verify-otp
// PUBLIC
// ============================================================

router.post(
  '/login/verify-otp',
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      // Required fields
      if (!email || !otp) {
        return res.status(400).json({
          message:
            'Email and OTP are required',
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      // OTP validation
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          message:
            'OTP must be exactly 6 digits',
        });
      }

      // Find OTP
      const verification =
        await EmailVerification.findOne({
          email: normalizedEmail,
        });

      if (!verification) {
        return res.status(400).json({
          message:
            'OTP not found. Please request a new OTP.',
        });
      }

      // Check expiry
      if (
        verification.expiresAt <
        new Date()
      ) {
        await EmailVerification.deleteOne({
          email: normalizedEmail,
        });

        return res.status(400).json({
          message:
            'OTP has expired. Please request a new OTP.',
        });
      }

      // Check attempts
      if (
        verification.attempts >= 5
      ) {
        await EmailVerification.deleteOne({
          email: normalizedEmail,
        });

        return res.status(400).json({
          message:
            'Too many incorrect attempts. Please request a new OTP.',
        });
      }

      // Hash entered OTP
      const otpHash = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

      // Compare OTP
      if (
        otpHash !== verification.otpHash
      ) {
        verification.attempts += 1;

        await verification.save();

        return res.status(400).json({
          message:
            'Invalid OTP. Please check the code and try again.',
        });
      }

      // Find user again
      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        return res.status(400).json({
          message: 'User not found.',
        });
      }

      // Check active account
      if (!user.isActive) {
        return res.status(403).json({
          message:
            'Your account has been deactivated. Please contact the administrator.',
        });
      }

      // Mark OTP verified
      verification.verified = true;
      verification.verifiedAt =
        new Date();

      await verification.save();

      // Update last login
      user.lastLogin = new Date();

      await user.save();

      // Create JWT
      const token =
        createToken(user);

      // Delete OTP after successful login
      await EmailVerification.deleteOne({
        email: normalizedEmail,
      });

      return res.status(200).json({
        message:
          'Login successful.',
        token,
        role: user.role,
      });
    } catch (err) {
      console.error(
        'Login Verify OTP error:',
        err.message
      );

      return res.status(500).json({
        message:
          'Unable to verify login OTP. Please try again.',
      });
    }
  }
);


// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// PROTECTED
// ============================================================

router.get(
  '/me',
  auth,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select('-password');

      if (!user) {
        return res.status(404).json({
          message:
            'User not found',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          message:
            'Your account has been deactivated.',
        });
      }

      return res.status(200).json(
        user
      );
    } catch (err) {
      console.error(
        'Get current user error:',
        err.message
      );

      return res.status(500).json({
        message:
          'Unable to fetch user information.',
      });
    }
  }
);


// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// PUBLIC
// ============================================================

router.post(
  '/forgot-password',
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            'Email is required.',
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      // Do not reveal whether account exists
      if (!user) {
        return res.status(200).json({
          message:
            'If an account exists with this email, a password reset link has been sent.',
        });
      }

      // Generate reset token
      const resetToken =
        crypto.randomBytes(32).toString('hex');

      const hashedToken =
        crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');

      user.resetPasswordToken =
        hashedToken;

      user.resetPasswordExpires =
        new Date(
          Date.now() + 15 * 60 * 1000
        );

      await user.save();

      // Correct reset URL
      const resetUrl =
        `http://localhost:5173/reset-password/${resetToken}`;

      console.log(
        'Password reset URL:',
        resetUrl
      );

      return res.status(200).json({
        message:
          'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (err) {
      console.error(
        'Forgot password error:',
        err.message
      );

      return res.status(500).json({
        message:
          'Unable to process password reset request.',
      });
    }
  }
);


// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password/:token
// PUBLIC
// ============================================================

router.post(
  '/reset-password/:token',
  async (req, res) => {
    try {
      const {
        password,
      } = req.body;

      const {
        token,
      } = req.params;

      if (!password) {
        return res.status(400).json({
          message:
            'New password is required.',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message:
            'Password must be at least 8 characters long.',
        });
      }

      if (!token) {
        return res.status(400).json({
          message:
            'Invalid password reset token.',
        });
      }

      // Hash token
      const hashedToken =
        crypto
          .createHash('sha256')
          .update(token)
          .digest('hex');

      // Find user
      const user =
        await User.findOne({
          resetPasswordToken:
            hashedToken,
          resetPasswordExpires: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(400).json({
          message:
            'Password reset token is invalid or has expired.',
        });
      }

      // Hash new password
      user.password =
        await bcrypt.hash(
          password,
          10
        );

      // Clear reset token
      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpires =
        undefined;

      await user.save();

      return res.status(200).json({
        message:
          'Password has been reset successfully.',
      });
    } catch (err) {
      console.error(
        'Reset password error:',
        err.message
      );

      return res.status(500).json({
        message:
          'Unable to reset password.',
      });
    }
  }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;