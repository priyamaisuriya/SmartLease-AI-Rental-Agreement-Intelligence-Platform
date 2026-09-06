const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    targetType: {
      type: String,
      default: '',
      trim: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: '',
    },

    userAgent: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: [
        'success',
        'failed'
      ],
      default: 'success',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({
  createdAt: -1
});

module.exports = mongoose.model(
  'ActivityLog',
  ActivityLogSchema
);
