const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit a new feedback
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { rating, category, feedback } = req.body;

    if (!rating || !category || !feedback) {
      return res.status(400).json({ msg: 'Please provide rating, category, and feedback text' });
    }

    const newFeedback = new Feedback({
      user: req.user.id,
      userName: req.user.name || '',
      rating,
      category,
      feedback,
      status: 'new'
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback submitted by the logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
