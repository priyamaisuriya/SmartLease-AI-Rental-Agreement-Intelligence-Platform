const crypto = require('crypto');

const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Property = require('../models/Property');
const User = require('../models/User');

// ============================================================
// CREATE MOCK PAYMENT ORDER
// TENANT CAN PAY ONLY AFTER LANDLORD ACCEPTS
// ============================================================

const createPaymentOrder = async (req, res) => {
    try {
        const { rentalId } = req.body;

        if (!rentalId) {
            return res.status(400).json({
                message: 'Rental ID is required'
            });
        }

        // ------------------------------------------------------
        // FIND RENTAL
        // ------------------------------------------------------

        const rental = await Rental.findById(rentalId);

        if (!rental) {
            return res.status(404).json({
                message: 'Rental not found'
            });
        }

        // ------------------------------------------------------
        // CHECK TENANT
        // ------------------------------------------------------

        if (
            rental.tenant.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    'You are not authorized to make this payment'
            });
        }

        // ------------------------------------------------------
        // PAYMENT ONLY AFTER ACCEPTANCE
        // ------------------------------------------------------

        if (rental.status !== 'active') {
            return res.status(400).json({
                message:
                    'Payment is available only after the landlord accepts the rental request'
            });
        }

        // ------------------------------------------------------
        // FIND PROPERTY
        // ------------------------------------------------------

        const property =
            await Property.findById(rental.property);

        if (!property) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        // ------------------------------------------------------
        // CHECK EXISTING PAID PAYMENT
        // ------------------------------------------------------

        const existingPaidPayment =
            await Payment.findOne({
                rental: rental._id,
                paymentStatus: 'paid'
            });

        if (existingPaidPayment) {
            return res.status(400).json({
                message:
                    'Payment has already been completed for this rental',
                payment: {
                    paymentId: existingPaidPayment._id,
                    transactionId:
                        existingPaidPayment.transactionId,
                    amount:
                        existingPaidPayment.amount,
                    currency:
                        existingPaidPayment.currency,
                    paymentStatus:
                        existingPaidPayment.paymentStatus,
                    paymentMethod:
                        existingPaidPayment.paymentMethod,
                    paidAt:
                        existingPaidPayment.paidAt
                }
            });
        }

        // ------------------------------------------------------
        // CALCULATE INITIAL PAYMENT
        // FIRST MONTH RENT + SECURITY DEPOSIT
        // ------------------------------------------------------

        const monthlyRent =
            Number(rental.monthlyRent || 0);

        const securityDeposit =
            Number(rental.securityDeposit || 0);

        const amount =
            monthlyRent + securityDeposit;

        if (amount <= 0) {
            return res.status(400).json({
                message:
                    'Invalid payment amount'
            });
        }

        // ------------------------------------------------------
        // CHECK EXISTING PENDING PAYMENT
        // ------------------------------------------------------

        const existingPayment =
            await Payment.findOne({
                rental: rental._id,
                paymentStatus: {
                    $in: [
                        'created',
                        'pending'
                    ]
                }
            });

        if (existingPayment) {
            return res.json({
                message:
                    'Payment order already exists',

                order: {
                    paymentId:
                        existingPayment._id,

                    transactionId:
                        existingPayment.transactionId,

                    amount:
                        existingPayment.amount,

                    currency:
                        existingPayment.currency,

                    propertyName:
                        property.title,

                    monthlyRent,

                    securityDeposit
                }
            });
        }

        // ------------------------------------------------------
        // GENERATE MOCK TRANSACTION ID
        // ------------------------------------------------------

        const transactionId =
            `MOCK_TXN_${Date.now()}_${crypto
                .randomBytes(4)
                .toString('hex')
                .toUpperCase()}`;

        // ------------------------------------------------------
        // CREATE PAYMENT
        // ------------------------------------------------------

        const payment =
            await Payment.create({

                rental:
                    rental._id,

                property:
                    property._id,

                tenant:
                    rental.tenant,

                landlord:
                    rental.landlord,

                amount,

                currency: 'INR',

                paymentType:
                    'initial_rent_and_deposit',

                transactionId,

                paymentStatus:
                    'created'
            });

        return res.status(201).json({

            message:
                'Mock payment order created successfully',

            order: {

                paymentId:
                    payment._id,

                transactionId:
                    payment.transactionId,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                propertyName:
                    property.title,

                monthlyRent,

                securityDeposit
            }

        });

    } catch (err) {

        console.error(
            'Create payment order error:',
            err
        );

        return res.status(500).json({
            message:
                'Server error while creating payment order'
        });
    }
};


// ============================================================
// PROCESS MOCK PAYMENT
// ============================================================

const processMockPayment = async (req, res) => {

    try {

        const {
            paymentId,
            paymentMethod,
            result
        } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                message:
                    'Payment ID is required'
            });
        }

        // ------------------------------------------------------
        // FIND PAYMENT
        // ------------------------------------------------------

        const payment =
            await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                message:
                    'Payment order not found'
            });
        }

        // ------------------------------------------------------
        // CHECK TENANT
        // ------------------------------------------------------

        if (
            payment.tenant.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    'You are not authorized to process this payment'
            });
        }

        // ------------------------------------------------------
        // PREVENT DUPLICATE PAYMENT
        // ------------------------------------------------------

        if (
            payment.paymentStatus ===
            'paid'
        ) {
            return res.status(400).json({
                message:
                    'Payment is already completed',

                payment: {
                    paymentId:
                        payment._id,

                    transactionId:
                        payment.transactionId,

                    amount:
                        payment.amount,

                    currency:
                        payment.currency,

                    paymentStatus:
                        payment.paymentStatus,

                    paymentMethod:
                        payment.paymentMethod,

                    paidAt:
                        payment.paidAt
                }
            });
        }

        // ------------------------------------------------------
        // MOCK FAILURE
        // ------------------------------------------------------

        if (result === 'failed') {

            payment.paymentStatus =
                'failed';

            payment.paymentMethod =
                paymentMethod ||
                'mock_card';

            await payment.save();

            return res.status(400).json({

                message:
                    'Mock payment failed',

                payment: {

                    paymentId:
                        payment._id,

                    transactionId:
                        payment.transactionId,

                    amount:
                        payment.amount,

                    currency:
                        payment.currency,

                    paymentStatus:
                        payment.paymentStatus,

                    paymentMethod:
                        payment.paymentMethod
                }

            });
        }

        // ------------------------------------------------------
        // MOCK SUCCESS
        // ------------------------------------------------------

        payment.paymentStatus =
            'paid';

        payment.paymentMethod =
            paymentMethod ||
            'mock_card';

        payment.paidAt =
            new Date();

        await payment.save();

        return res.json({

            message:
                'Mock payment completed successfully',

            payment: {

                paymentId:
                    payment._id,

                transactionId:
                    payment.transactionId,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                paymentStatus:
                    payment.paymentStatus,

                paymentMethod:
                    payment.paymentMethod,

                paidAt:
                    payment.paidAt
            }

        });

    } catch (err) {

        console.error(
            'Process mock payment error:',
            err
        );

        return res.status(500).json({
            message:
                'Server error while processing payment'
        });
    }
};


// ============================================================
// GET PAYMENT STATUS
// ============================================================

const getPaymentStatus = async (req, res) => {

    try {

        const {
            rentalId
        } = req.params;

        // ------------------------------------------------------
        // FIND RENTAL
        // ------------------------------------------------------

        const rental =
            await Rental.findById(rentalId);

        if (!rental) {
            return res.status(404).json({
                message:
                    'Rental not found'
            });
        }

        // ------------------------------------------------------
        // CHECK ACCESS
        // TENANT / LANDLORD / ADMIN
        // ------------------------------------------------------

        if (
            rental.tenant.toString() !==
            req.user.id &&

            rental.landlord.toString() !==
            req.user.id &&

            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'You do not have access to this payment'
            });
        }

        // ------------------------------------------------------
        // FIND LATEST PAYMENT
        // ------------------------------------------------------

        const payment =
            await Payment.findOne({
                rental: rental._id
            })
            .sort({
                createdAt: -1
            });

        // ------------------------------------------------------
        // NO PAYMENT FOUND
        // ------------------------------------------------------

        if (!payment) {

            return res.json({

                hasPayment: false,

                payment: null

            });
        }

        // ------------------------------------------------------
        // RETURN CONSISTENT PAYMENT OBJECT
        // IMPORTANT:
        // FRONTEND USES payment.paymentId
        // ------------------------------------------------------

        return res.json({

            hasPayment: true,

            payment: {

                paymentId:
                    payment._id,

                transactionId:
                    payment.transactionId,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                paymentType:
                    payment.paymentType,

                paymentStatus:
                    payment.paymentStatus,

                paymentMethod:
                    payment.paymentMethod,

                paidAt:
                    payment.paidAt,

                rental:
                    payment.rental,

                property:
                    payment.property,

                tenant:
                    payment.tenant,

                landlord:
                    payment.landlord,

                createdAt:
                    payment.createdAt,

                updatedAt:
                    payment.updatedAt
            }

        });

    } catch (err) {

        console.error(
            'Get payment status error:',
            err
        );

        return res.status(500).json({
            message:
                'Server error'
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    createPaymentOrder,

    processMockPayment,

    getPaymentStatus

};