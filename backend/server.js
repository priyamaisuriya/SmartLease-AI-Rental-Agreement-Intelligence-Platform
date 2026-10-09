require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const {
  startRentReminderScheduler
} = require('./services/rentReminderScheduler');

const { loadSettings } = require('./services/settingsService');

if (process.env.NODE_ENV === 'production') {
  ['MONGO_URI', 'JWT_SECRET'].forEach((name) => {
    if (!process.env[name]) {
      console.error(`Missing required environment variable: ${name}`);
      process.exit(1);
    }
  });
}

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
  
const notificationRoutes =
  require('./routes/notificationRoutes');


// ============================================================
// MIDDLEWARE
// ============================================================

// Set CORS_ORIGIN (comma separated) to restrict browsers to your frontend.
// Unset keeps the previous open behaviour for local development.
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors(corsOrigins.length ? { origin: corsOrigins } : undefined));

app.use(express.json({ limit: '1mb' }));


// ============================================================
// STATIC UPLOADS
// ============================================================

app.use('/uploads/agreements', (req, res, next) => {
  res.status(403).json({ message: 'Direct access to agreements is forbidden. Use secure download API.' });
});

app.use('/uploads/invoices', (req, res, next) => {
  res.status(403).json({ message: 'Direct access to invoices is forbidden. Use secure download API.' });
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

    loadSettings();

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
  '/api/notifications',
  notificationRoutes
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

app.use(
  '/api/admin/settings',
  require('./routes/adminSettingsRoutes')
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
// ERROR HANDLING
// ============================================================

app.use((err, req, res, next) => {

  if (res.headersSent) {
    return next(err);
  }

  // Upload problems (wrong type, too large, unexpected field) are client errors.
  if (err && (err.name === 'MulterError' || /Only .* files are allowed/i.test(err.message || ''))) {
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message
    });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({ message: 'Server error' });

});


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