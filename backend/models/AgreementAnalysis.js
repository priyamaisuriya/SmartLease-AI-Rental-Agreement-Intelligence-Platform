const mongoose = require('mongoose');

const AgreementAnalysisSchema = new mongoose.Schema(
  {
    agreement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement',
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: [
        'summary',
        'risk',
        'clause_explanation',
        'question'
      ],
      required: true,
    },

    input: {
      type: String,
      default: '',
    },

    result: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'AgreementAnalysis',
  AgreementAnalysisSchema
);
