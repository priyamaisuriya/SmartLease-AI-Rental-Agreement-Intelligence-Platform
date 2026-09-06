const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const requirePermission = require('../middleware/permissions');

const {
    summarizeAgreement,
    explainAgreementClause,
    analyzeAgreementRisks,
    askAgreementQuestion,
    getAgreementAnalysisHistory,
    getLatestSummary,
    getLatestRisks
} = require('../controllers/aiController');


/*
 * Generate summary
 */
router.post(
    '/agreements/:id/summary',
    auth,
    requirePermission('agreement-summary'),
    summarizeAgreement
);


/*
 * Get latest summary
 *
 * IMPORTANT:
 * This route must come before /agreements/:id/...
 * patterns that could otherwise conflict.
 */
router.get(
    '/agreements/:id/summary/latest',
    auth,
    requirePermission('agreement-summary'),
    getLatestSummary
);


/*
 * Explain clause
 */
router.post(
    '/agreements/:id/explain-clause',
    auth,
    requirePermission('clause-explanation'),
    explainAgreementClause
);


/*
 * Generate risk analysis
 */
router.post(
    '/agreements/:id/risks',
    auth,
    requirePermission('risk-detection'),
    analyzeAgreementRisks
);


/*
 * Get latest risk analysis
 */
router.get(
    '/agreements/:id/risks/latest',
    auth,
    requirePermission('risk-detection'),
    getLatestRisks
);


/*
 * Ask question
 */
router.post(
    '/agreements/:id/ask',
    auth,
    requirePermission('agreement-analysis'),
    askAgreementQuestion
);


/*
 * Complete AI history
 */
router.get(
    '/agreements/:id/history',
    auth,
    requirePermission('agreement-analysis'),
    getAgreementAnalysisHistory
);


module.exports = router;