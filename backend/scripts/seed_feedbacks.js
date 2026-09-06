const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Feedback = require('../models/Feedback');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const mockFeedbacks = [
  {
    userName: 'Ananya Rao',
    rating: 4,
    category: 'Agreement Analysis',
    feedback: 'The AI highlighted exactly the clause I was worried about. Great tool!',
    status: 'new'
  },
  {
    userName: 'Meera Shah',
    rating: 5,
    category: 'UI/UX',
    feedback: 'Dashboard looks great, would love to see rent collection integrated.',
    status: 'reviewed'
  },
  {
    userName: 'Rakesh Patel',
    rating: 3,
    category: 'Property Search',
    feedback: 'Filters are a bit slow on mobile devices.',
    status: 'new'
  },
  {
    userName: 'John Smith',
    rating: 5,
    category: 'Feature Request',
    feedback: 'Can we have a dark mode option?',
    status: 'archived'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Clear existing feedback
    await Feedback.deleteMany({});
    
    // Insert mock data
    await Feedback.insertMany(mockFeedbacks);
    
    console.log('Feedbacks seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding feedbacks:', err);
    process.exit(1);
  }
}

seed();
