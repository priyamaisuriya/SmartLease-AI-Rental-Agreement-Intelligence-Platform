require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const {
  startRentReminderScheduler
} = require('./services/rentReminderScheduler');

const app = express();

const PORT = process.env.PORT || 5000;


// ============================================================
// ROUTES
// ============================================================

const permissionRoutes =
  require('./routes/permissionRoutes');

const propertyRoutes =
  require('./routes/propertyRoutes');

const rentalRoutes =
  require('./routes/rentalRoutes');
const paymentRoutes =
  require('./routes/paymentRoutes');

const agreementRoutes =
  require('./routes/agreementRoutes');

const aiRoutes =
  require('./routes/aiRoutes');

const aiUsageRoutes =
  require('./routes/aiUsageRoutes');

const rentReminderRoutes =
  require('./routes/rentReminderRoutes');

const adminDashboardRoutes =
  require('./routes/adminDashboardRoutes');

const adminAgreementRoutes =
  require('./routes/adminAgreementRoutes');

const adminPropertyRoutes =
  require('./routes/adminPropertyRoutes');

const adminRentalRoutes =
  require('./routes/adminRentalRoutes');

const adminRentReminderRoutes =
  require('./routes/adminRentReminderRoutes');

const activityLogRoutes =
  require('./routes/activityLogRoutes');

const adminReportRoutes =
  require('./routes/adminReportRoutes');

const adminFeedbackRoutes =
  require('./routes/adminFeedbackRoutes');

const feedbackRoutes =
  require('./routes/feedbackRoutes');


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// STATIC UPLOADS
// ============================================================

app.use('/uploads/agreements', (req, res, next) => {
  res.status(403).json({ message: 'Direct access to agreements is forbidden. Use secure download API.' });
});

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);


// ============================================================
// MONGODB CONNECTION
// ============================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log('MongoDB connected');

    startRentReminderScheduler();

  })
  .catch((err) => {

    console.error(
      'MongoDB connection error:',
      err
    );

  });


// ============================================================
// AUTH ROUTES
// ============================================================

app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/users',
  require('./routes/users')
);


// ============================================================
// MAIN APPLICATION ROUTES
// ============================================================

app.use(
  '/api/permissions',
  permissionRoutes
);

app.use(
  '/api/properties',
  propertyRoutes
);

app.use(
  '/api/rentals',
  rentalRoutes
);
app.use(
  '/api/payments',
  paymentRoutes
);
app.use(
  '/api/agreements',
  agreementRoutes
);

app.use(
  '/api/ai',
  aiRoutes
);

app.use(
  '/api/ai-usage',
  aiUsageRoutes
);

app.use(
  '/api/feedback',
  feedbackRoutes
);

app.use(
  '/api/rent-reminders',
  rentReminderRoutes
);


// ============================================================
// ADMIN ROUTES
// ============================================================

app.use(
  '/api/admin/dashboard',
  adminDashboardRoutes
);

app.use(
  '/api/admin/agreements',
  adminAgreementRoutes
);

app.use(
  '/api/admin/properties',
  adminPropertyRoutes
);

app.use(
  '/api/admin/rentals',
  adminRentalRoutes
);

app.use(
  '/api/admin/rent-reminders',
  adminRentReminderRoutes
);

app.use(
  '/api/admin/reports',
  adminReportRoutes
);

app.use(
  '/api/admin/feedback',
  adminFeedbackRoutes
);

app.use(
  '/api/admin/logs',
  activityLogRoutes
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (req, res) => {

    res.status(200).json({
      status: 'OK',
      message: 'Backend is running!'
    });

  }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server is running on port ${PORT}`
    );

  }
);