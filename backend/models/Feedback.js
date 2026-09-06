const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow null if the user is anonymous, but usually we map to a User
    },
    // We can optionally store a string name for users who don't have an ID
    userName: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'archived'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ status: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
