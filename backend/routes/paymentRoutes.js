const express = require('express');

const router =
  express.Router();


const {
  createPaymentOrder,
  processMockPayment,
  getPaymentStatus,
  downloadInvoice
} = require(
  '../controllers/paymentController'
);


const auth =
  require('../middleware/auth');


// ============================================================
// CREATE MOCK PAYMENT ORDER
// ============================================================

router.post(
  '/create-order',
  auth,
  createPaymentOrder
);


// ============================================================
// PROCESS MOCK PAYMENT
// ============================================================

router.post(
  '/process',
  auth,
  processMockPayment
);


// ============================================================
// PAYMENT STATUS
// ============================================================

router.get(
  '/status/:rentalId',
  auth,
  getPaymentStatus
);


// ============================================================
// DOWNLOAD INVOICE
// ============================================================

router.get(
  '/invoice/:paymentId',
  auth,
  downloadInvoice
);


module.exports = router;