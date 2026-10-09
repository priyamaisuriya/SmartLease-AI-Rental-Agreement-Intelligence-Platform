const fs = require('fs');
const path = require('path');

const rentalControllerPath = path.join(__dirname, 'backend/controllers/rentalController.js');
const paymentControllerPath = path.join(__dirname, 'backend/controllers/paymentController.js');
const agreementControllerPath = path.join(__dirname, 'backend/controllers/agreementController.js');

let rentalContent = fs.readFileSync(rentalControllerPath, 'utf8');

// 1. Add import to rentalController.js
if (!rentalContent.includes("createNotification")) {
    rentalContent = rentalContent.replace(
        "const { createActivityLog } = require('../services/activityLogService');",
        "const { createActivityLog } = require('../services/activityLogService');\nconst { createNotification } = require('../services/notificationService');"
    );
}

// 2. bookProperty notifications
if (!rentalContent.includes("Your rental request for")) {
    rentalContent = rentalContent.replace(
        "status: 'success'",
        "status: 'success'\n        });\n\n        await createNotification({ user: req.user.id, title: 'Request Submitted', message: `Your rental request for ${property.title} has been submitted.`, type: 'rental_request', relatedEntityModel: 'Rental', relatedEntityId: rental._id });\n        await createNotification({ user: property.landlord, title: 'New Rental Request', message: `You have received a new rental request for ${property.title}.`, type: 'rental_request', relatedEntityModel: 'Rental', relatedEntityId: rental._id });"
    );
}

// 3. updateRentalStatus notifications
if (!rentalContent.includes("Rental Request Accepted")) {
    rentalContent = rentalContent.replace(
        "rental.status = 'accepted';",
        "rental.status = 'accepted';\n        await createNotification({ user: rental.tenant, title: 'Rental Request Accepted', message: `Your request for ${property.title} was accepted. Waiting for agreement.`, type: 'rental_update', relatedEntityModel: 'Rental', relatedEntityId: rental._id });"
    );
}

if (!rentalContent.includes("Rental Request Rejected")) {
    rentalContent = rentalContent.replace(
        "rental.status = 'rejected';",
        "rental.status = 'rejected';\n        await createNotification({ user: rental.tenant, title: 'Rental Request Rejected', message: `Your request for ${property.title} was rejected.`, type: 'rental_update', relatedEntityModel: 'Rental', relatedEntityId: rental._id });"
    );
}

// 4. acceptAgreement
if (!rentalContent.includes("Agreement Accepted")) {
    rentalContent = rentalContent.replace(
        "rental.status =\n            'agreement_accepted';",
        "rental.status =\n            'agreement_accepted';\n        await createNotification({ user: rental.tenant, title: 'Agreement Accepted', message: 'You have accepted the rental agreement. Proceed to payment.', type: 'agreement_update', relatedEntityModel: 'Rental', relatedEntityId: rental._id });\n        await createNotification({ user: rental.landlord, title: 'Agreement Accepted', message: 'The tenant has accepted the rental agreement.', type: 'agreement_update', relatedEntityModel: 'Rental', relatedEntityId: rental._id });"
    );
}

// 5. confirmBooking
if (!rentalContent.includes("Booking Confirmed")) {
    rentalContent = rentalContent.replace(
        "rental.status =\n            'confirmed';",
        "rental.status =\n            'confirmed';\n        await createNotification({ user: rental.tenant, title: 'Booking Confirmed', message: 'Your booking has been successfully confirmed.', type: 'rental_update', relatedEntityModel: 'Rental', relatedEntityId: rental._id });\n        await createNotification({ user: rental.landlord, title: 'Booking Confirmed', message: 'A booking has been successfully confirmed.', type: 'rental_update', relatedEntityModel: 'Rental', relatedEntityId: rental._id });"
    );
}

// 5.1 conflict in confirmBooking
if (!rentalContent.includes("Date Conflict Detected")) {
    rentalContent = rentalContent.replace(
        "rental.status = 'conflict';",
        "rental.status = 'conflict';\n        await createNotification({ user: rental.tenant, title: 'Date Conflict Detected', message: 'Unfortunately, this property was just confirmed by another user for the same dates. Your payment has been marked for a refund.', type: 'system', relatedEntityModel: 'Rental', relatedEntityId: rental._id });\n        await createNotification({ user: rental.landlord, title: 'Overlapping Request Cancelled', message: 'An overlapping paid request was automatically cancelled due to date conflict.', type: 'system', relatedEntityModel: 'Rental', relatedEntityId: rental._id });"
    );
}

fs.writeFileSync(rentalControllerPath, rentalContent);
console.log("Updated rentalController.js");

// PAYMENT CONTROLLER
let paymentContent = fs.readFileSync(paymentControllerPath, 'utf8');

if (!paymentContent.includes("createNotification")) {
    paymentContent = paymentContent.replace(
        "const { sendInvoiceEmail } = require('../services/emailService');",
        "const { sendInvoiceEmail } = require('../services/emailService');\nconst { createNotification } = require('../services/notificationService');"
    );
}

if (!paymentContent.includes("Payment Successful")) {
    paymentContent = paymentContent.replace(
        "payment.paymentStatus =\n            'paid';",
        "payment.paymentStatus =\n            'paid';\n        await createNotification({ user: rental.tenant, title: 'Payment Successful', message: 'Your payment was successful. Please confirm your booking.', type: 'payment_update', relatedEntityModel: 'Payment', relatedEntityId: payment._id });\n        await createNotification({ user: rental.landlord, title: 'Payment Completed', message: 'The tenant has completed the payment.', type: 'payment_update', relatedEntityModel: 'Payment', relatedEntityId: payment._id });"
    );
}

fs.writeFileSync(paymentControllerPath, paymentContent);
console.log("Updated paymentController.js");

// AGREEMENT CONTROLLER
let agreementContent = fs.readFileSync(agreementControllerPath, 'utf8');

if (!agreementContent.includes("createNotification")) {
    agreementContent = agreementContent.replace(
        "const { createActivityLog } = require('../services/activityLogService');",
        "const { createActivityLog } = require('../services/activityLogService');\nconst { createNotification } = require('../services/notificationService');"
    );
}

if (!agreementContent.includes("Agreement Uploaded")) {
    agreementContent = agreementContent.replace(
        "rental.status = 'agreement_pending';",
        "rental.status = 'agreement_pending';\n        await createNotification({ user: rental.tenant, title: 'Agreement Uploaded', message: `The landlord has uploaded the rental agreement for ${property.title}. Please review it.`, type: 'agreement_update', relatedEntityModel: 'Agreement', relatedEntityId: newAgreement._id });"
    );
}

fs.writeFileSync(agreementControllerPath, agreementContent);
console.log("Updated agreementController.js");
