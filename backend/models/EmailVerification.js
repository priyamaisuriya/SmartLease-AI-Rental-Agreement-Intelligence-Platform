const mongoose = require('mongoose');

const EmailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired OTP documents
EmailVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  'EmailVerification',
  EmailVerificationSchema
);