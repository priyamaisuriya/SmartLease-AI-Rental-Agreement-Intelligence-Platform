const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Get all feedback for admin
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update feedback status
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'reviewed', 'archived'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    let feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Feedback not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
