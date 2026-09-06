const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const requirePermission = require('../middleware/permissions');
const agreementUpload = require('../middleware/agreementUpload');

const {
    uploadAgreement,
    getMyAgreements,
    getAgreementById,
    updateAgreement,
    terminateAgreement
} = require('../controllers/agreementController');


// Landlord uploads agreement
router.post(
    '/upload',
    auth,
    requirePermission('agreement-upload'),
    agreementUpload.single('agreement'),
    uploadAgreement
);


// Tenant / Landlord / Admin get their agreements
router.get(
    '/my-agreements',
    auth,
    requirePermission('agreement-history'),
    getMyAgreements
);


// Get specific agreement
router.get(
    '/:id',
    auth,
    requirePermission('agreement-view'),
    getAgreementById
);


// Update agreement
router.put(
    '/:id',
    auth,
    requirePermission('agreement-view'),
    updateAgreement
);


// Terminate agreement
router.put(
    '/:id/terminate',
    auth,
    requirePermission('agreement-view'),
    terminateAgreement
);


module.exports = router;