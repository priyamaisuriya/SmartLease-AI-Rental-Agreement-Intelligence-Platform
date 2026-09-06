const mongoose = require('mongoose');

const RentReminderSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
      index: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        'upcoming',
        'due',
        'overdue',
        'paid',
        'cancelled'
      ],
      default: 'upcoming',
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


/*
 * Prevent duplicate reminder for the same
 * rental and due date.
 */
RentReminderSchema.index(
  {
    rental: 1,
    dueDate: 1
  },
  {
    unique: true
  }
);


module.exports = mongoose.model(
  'RentReminder',
  RentReminderSchema
);
