const mongoose = require('mongoose');

const AIUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    agreement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement',
      default: null,
      index: true,
    },

    operation: {
      type: String,
      enum: [
        'summary',
        'clause_explanation',
        'risk_detection',
        'question'
      ],
      required: true,
    },

    model: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: [
        'success',
        'failed'
      ],
      required: true,
    },

    errorMessage: {
      type: String,
      default: '',
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'AIUsage',
  AIUsageSchema
);
