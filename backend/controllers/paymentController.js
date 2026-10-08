const fs = require('fs');
const path = require('path');

const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Property = require('../models/Property');
const User = require('../models/User');

const {
  generateInvoice
} = require('../services/invoiceService');

const {
  sendInvoiceEmail
} = require('../services/emailService');


// ============================================================
// CREATE MOCK PAYMENT ORDER
// ============================================================

const createPaymentOrder = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      rentalId
    } = req.body;


    if (!rentalId) {

      return res.status(400).json({
        message: 'Rental ID is required.'
      });

    }


    // --------------------------------------------------------
    // FIND RENTAL
    // --------------------------------------------------------

    const rental =
      await Rental.findById(rentalId);

    if (!rental) {

      return res.status(404).json({
        message: 'Rental not found.'
      });

    }


    // --------------------------------------------------------
    // CHECK TENANT
    // --------------------------------------------------------

    if (
      rental.tenant.toString() !==
      userId.toString()
    ) {

      return res.status(403).json({
        message: 'You are not authorized to make this payment.'
      });

    }


    // --------------------------------------------------------
    // PAYMENT ONLY AFTER LANDLORD APPROVAL
    // --------------------------------------------------------

    if (
      rental.status !== 'active'
    ) {

      return res.status(400).json({
        message: 'Payment is available only after landlord approval.'
      });

    }


    // --------------------------------------------------------
    // FIND PROPERTY
    // --------------------------------------------------------

    const property =
      await Property.findById(
        rental.property
      );

    if (!property) {

      return res.status(404).json({
        message: 'Property not found.'
      });

    }


    // --------------------------------------------------------
    // CHECK EXISTING PAID PAYMENT
    // --------------------------------------------------------

    const existingPaidPayment =
      await Payment.findOne({
        rental: rental._id,
        paymentStatus: 'paid'
      }).sort({
        createdAt: -1
      });


    if (existingPaidPayment) {

      return res.status(400).json({
        message: 'Payment has already been completed.',
        payment: existingPaidPayment
      });

    }


    // --------------------------------------------------------
    // PAYMENT AMOUNT
    // --------------------------------------------------------

    const monthlyRent =
      Number(
        rental.monthlyRent || 0
      );

    const securityDeposit =
      Number(
        rental.securityDeposit || 0
      );

    const totalAmount =
      monthlyRent +
      securityDeposit;


    if (totalAmount <= 0) {

      return res.status(400).json({
        message: 'Invalid payment amount.'
      });

    }


    // --------------------------------------------------------
    // CHECK EXISTING CREATED/PENDING PAYMENT
    // --------------------------------------------------------

    let payment =
      await Payment.findOne({
        rental: rental._id,
        tenant: userId,
        paymentStatus: {
          $in: [
            'created',
            'pending'
          ]
        }
      }).sort({
        createdAt: -1
      });


    // --------------------------------------------------------
    // CREATE PAYMENT
    // --------------------------------------------------------

    if (!payment) {

      const transactionId =
        `MOCK_TXN_${Date.now()}_${Math.random()
          .toString(16)
          .slice(2, 10)
          .toUpperCase()}`;


      payment =
        await Payment.create({

          rental: rental._id,

          property:
            property._id,

          tenant:
            rental.tenant,

          landlord:
            rental.landlord,

          amount:
            totalAmount,

          currency:
            'INR',

          paymentType:
            'initial_rent_and_deposit',

          transactionId,

          paymentStatus:
            'created',

          paymentMethod:
            'mock_card'

        });

    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({

      message:
        'Mock payment order created successfully.',

      order: {

        paymentId:
          payment._id,

        amount:
          payment.amount,

        currency:
          payment.currency,

        transactionId:
          payment.transactionId,

        paymentStatus:
          payment.paymentStatus

      }

    });

  } catch (error) {

    console.error(
      'Create payment order error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to create payment order.',
      error: error.message
    });

  }

};


// ============================================================
// PROCESS MOCK PAYMENT
// ============================================================

const processMockPayment = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      paymentId,
      paymentMethod,
      result
    } = req.body;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!paymentId) {

      return res.status(400).json({
        message: 'Payment ID is required.'
      });

    }


    if (
      ![
        'mock_card',
        'mock_upi',
        'mock_netbanking'
      ].includes(paymentMethod)
    ) {

      return res.status(400).json({
        message: 'Invalid payment method.'
      });

    }


    if (
      ![
        'success',
        'failed'
      ].includes(result)
    ) {

      return res.status(400).json({
        message: 'Invalid payment result.'
      });

    }


    // --------------------------------------------------------
    // FIND PAYMENT
    // --------------------------------------------------------

    const payment =
      await Payment.findById(
        paymentId
      );

    if (!payment) {

      return res.status(404).json({
        message: 'Payment not found.'
      });

    }


    // --------------------------------------------------------
    // TENANT AUTHORIZATION
    // --------------------------------------------------------

    if (
      payment.tenant.toString() !==
      userId.toString()
    ) {

      return res.status(403).json({
        message: 'You are not authorized to process this payment.'
      });

    }


    // --------------------------------------------------------
    // ALREADY PAID
    // --------------------------------------------------------

    if (
      payment.paymentStatus === 'paid'
    ) {

      return res.status(200).json({

        message:
          'Payment has already been completed.',

        payment: {

          ...payment.toObject(),

          paymentId:
            payment._id,

          invoiceGenerated:
            Boolean(
              payment.invoiceNumber
            ),

          invoiceEmailSent:
            Boolean(
              payment.invoiceEmailSentAt
            )

        }

      });

    }


    // ========================================================
    // FAILED PAYMENT
    // ========================================================

    if (result === 'failed') {

      payment.paymentStatus =
        'failed';

      payment.paymentMethod =
        paymentMethod;

      await payment.save();


      return res.status(200).json({

        message:
          'Mock payment failed.',

        payment: {

          ...payment.toObject(),

          paymentId:
            payment._id

        }

      });

    }


    // ========================================================
    // SUCCESSFUL PAYMENT
    // ========================================================

    payment.paymentStatus =
      'paid';

    payment.paymentMethod =
      paymentMethod;

    payment.paidAt =
      new Date();


    await payment.save();


    // --------------------------------------------------------
    // FIND RENTAL
    // --------------------------------------------------------

    const rental =
      await Rental.findById(
        payment.rental
      );


    if (!rental) {

      console.error(
        'Rental not found for payment:',
        payment._id
      );

    }


    // --------------------------------------------------------
    // FIND TENANT
    // --------------------------------------------------------

    const tenant =
      await User.findById(
        payment.tenant
      ).select(
        'name email'
      );


    // --------------------------------------------------------
    // FIND PROPERTY
    // --------------------------------------------------------

    const property =
      await Property.findById(
        payment.property
      );


    // ========================================================
    // GENERATE INVOICE
    // ========================================================

    let invoiceGenerated =
      false;

    let invoiceEmailSent =
      false;


    if (
      tenant &&
      property &&
      rental
    ) {

      try {

        // ----------------------------------------------------
        // INVOICE NUMBER
        // ----------------------------------------------------

        const year =
          new Date()
            .getFullYear();

        const shortPaymentId =
          payment._id
            .toString()
            .slice(-8)
            .toUpperCase();


        const invoiceNumber =
          `INV-${year}-${shortPaymentId}`;


        // ----------------------------------------------------
        // PROPERTY ADDRESS
        // ----------------------------------------------------

        const addressParts = [

          property.address,

          property.landmark,

          property.city,

          property.state,

          property.pincode

        ].filter(Boolean);


        const propertyAddress =
          addressParts.join(', ');


        // ----------------------------------------------------
        // GENERATE PDF
        // ----------------------------------------------------

        const invoice =
          await generateInvoice({

            invoiceNumber,

            transactionId:
              payment.transactionId,

            invoiceDate:
              payment.paidAt ||
              new Date(),

            tenantName:
              tenant.name || 'Tenant',

            tenantEmail:
              tenant.email,

            propertyTitle:
              property.title ||
              'Rental Property',

            propertyAddress,

            monthlyRent:
              Number(
                rental.monthlyRent || 0
              ),

            securityDeposit:
              Number(
                rental.securityDeposit || 0
              ),

            totalAmount:
              Number(
                payment.amount || 0
              ),

            paymentStatus:
              payment.paymentStatus,

            paymentMethod:
              payment.paymentMethod

          });


        // ----------------------------------------------------
        // SAVE INVOICE INFORMATION
        // ----------------------------------------------------

        payment.invoiceNumber =
          invoice.invoiceNumber;

        payment.invoicePath =
          invoice.filePath;

        payment.invoiceGeneratedAt =
          new Date();


        await payment.save();


        invoiceGenerated =
          true;


        console.log(
          'Invoice generated:',
          invoice.filePath
        );


        // ====================================================
        // SEND INVOICE EMAIL
        // ====================================================

        try {

          await sendInvoiceEmail({

            email:
              tenant.email,

            tenantName:
              tenant.name || 'Tenant',

            invoiceNumber:
              invoice.invoiceNumber,

            propertyTitle:
              property.title ||
              'Rental Property',

            transactionId:
              payment.transactionId,

            totalAmount:
              payment.amount,

            paymentMethod:
              payment.paymentMethod,

            invoicePath:
              invoice.filePath

          });


          payment.invoiceEmailSentAt =
            new Date();


          await payment.save();


          invoiceEmailSent =
            true;


          console.log(
            'Invoice email sent to:',
            tenant.email
          );

        } catch (emailError) {

          console.error(
            'Invoice email error:',
            emailError
          );

        }

      } catch (invoiceError) {

        console.error(
          'Invoice generation error:',
          invoiceError
        );

      }

    }


    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    let message =
      'Payment successful.';


    if (invoiceGenerated) {

      message +=
        ' Invoice generated successfully.';

    }


    if (invoiceEmailSent) {

      message +=
        ' Invoice has been sent to your registered email.';

    } else if (invoiceGenerated) {

      message +=
        ' Invoice email could not be confirmed.';

    } else {

      message +=
        ' Invoice generation could not be completed.';

    }


    return res.status(200).json({

      message,

      payment: {

        ...payment.toObject(),

        paymentId:
          payment._id,

        invoiceGenerated,

        invoiceEmailSent

      }

    });

  } catch (error) {

    console.error(
      'Process mock payment error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to process payment.',
      error: error.message
    });

  }

};


// ============================================================
// GET PAYMENT STATUS
// ============================================================

const getPaymentStatus = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.id;

    const {
      rentalId
    } = req.params;


    // --------------------------------------------------------
    // FIND RENTAL
    // --------------------------------------------------------

    const rental =
      await Rental.findById(
        rentalId
      );

    if (!rental) {

      return res.status(404).json({
        message: 'Rental not found.'
      });

    }


    // --------------------------------------------------------
    // ACCESS CHECK
    // --------------------------------------------------------

    const isTenant =
      rental.tenant?.toString() ===
      userId.toString();

    const isLandlord =
      rental.landlord?.toString() ===
      userId.toString();


    const user =
      await User.findById(
        userId
      ).select(
        'role'
      );


    const isAdmin =
      user?.role === 'admin';


    if (
      !isTenant &&
      !isLandlord &&
      !isAdmin
    ) {

      return res.status(403).json({
        message: 'You are not authorized to view this payment.'
      });

    }


    // --------------------------------------------------------
    // FIND PAYMENT
    // --------------------------------------------------------

    const payment =
      await Payment.findOne({
        rental: rentalId
      }).sort({
        createdAt: -1
      });


    if (!payment) {

      return res.status(200).json({

        hasPayment:
          false,

        payment:
          null

      });

    }


    return res.status(200).json({

      hasPayment:
        true,

      payment: {

        ...payment.toObject(),

        paymentId:
          payment._id,

        invoiceGenerated:
          Boolean(
            payment.invoiceNumber
          ),

        invoiceEmailSent:
          Boolean(
            payment.invoiceEmailSentAt
          )

      }

    });

  } catch (error) {

    console.error(
      'Get payment status error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to get payment status.',
      error: error.message
    });

  }

};


// ============================================================
// DOWNLOAD INVOICE
// ============================================================

const downloadInvoice = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.id;

    const {
      paymentId
    } = req.params;


    // --------------------------------------------------------
    // FIND PAYMENT
    // --------------------------------------------------------

    const payment =
      await Payment.findById(
        paymentId
      );


    if (!payment) {

      return res.status(404).json({
        message: 'Payment not found.'
      });

    }


    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user =
      await User.findById(
        userId
      ).select(
        'role'
      );


    const isTenant =
      payment.tenant?.toString() ===
      userId.toString();

    const isLandlord =
      payment.landlord?.toString() ===
      userId.toString();

    const isAdmin =
      user?.role === 'admin';


    // --------------------------------------------------------
    // ACCESS CONTROL
    // --------------------------------------------------------

    if (
      !isTenant &&
      !isLandlord &&
      !isAdmin
    ) {

      return res.status(403).json({
        message: 'You are not authorized to download this invoice.'
      });

    }


    // --------------------------------------------------------
    // CHECK INVOICE
    // --------------------------------------------------------

    if (
      !payment.invoicePath ||
      !payment.invoiceNumber
    ) {

      return res.status(404).json({
        message: 'Invoice is not available yet.'
      });

    }


    // --------------------------------------------------------
    // CHECK FILE
    // --------------------------------------------------------

    if (
      !fs.existsSync(
        payment.invoicePath
      )
    ) {

      return res.status(404).json({
        message: 'Invoice PDF file was not found.'
      });

    }


    // --------------------------------------------------------
    // DOWNLOAD
    // --------------------------------------------------------

    return res.download(
      payment.invoicePath,
      `${payment.invoiceNumber}.pdf`,
      (error) => {

        if (error) {

          console.error(
            'Invoice download error:',
            error
          );

        }

      }
    );

  } catch (error) {

    console.error(
      'Download invoice error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to download invoice.',
      error: error.message
    });

  }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  createPaymentOrder,

  processMockPayment,

  getPaymentStatus,

  downloadInvoice

};