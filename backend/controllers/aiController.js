const Agreement = require('../models/Agreement');
const AgreementAnalysis = require('../models/AgreementAnalysis');
const AIUsage = require('../models/AIUsage');

const {
    generateAgreementSummary,
    explainClause,
    detectAgreementRisks,
    answerAgreementQuestion
} = require('../services/aiService');

const {
    createActivityLog
} = require('../services/activityLogService');


// =====================================================
// RECORD AI USAGE
// =====================================================

const recordAIUsage = async ({
    user,
    agreement,
    operation,
    status,
    errorMessage = ''
}) => {
    try {
        await AIUsage.create({
            user,
            agreement,
            operation,
            model:
                process.env.GEMINI_MODEL || '',
            status,
            errorMessage
        });
    } catch (err) {
        console.error(
            'AI usage logging error:',
            err.message
        );
    }
};


// =====================================================
// CHECK AGREEMENT AUTHORIZATION
// =====================================================

const getAuthorizedAgreement = async (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        res.status(401).json({
            message:
                'Authentication required'
        });

        return null;
    }

    const agreement =
        await Agreement.findById(
            req.params.id
        );

    if (!agreement) {
        res.status(404).json({
            message:
                'Agreement not found'
        });

        return null;
    }

    const isAdmin =
        req.user.role === 'admin';

    const isLandlord =
        agreement.landlord.toString() ===
        req.user.id;

    const isTenant =
        agreement.tenant.toString() ===
        req.user.id;

    if (
        !isAdmin &&
        !isLandlord &&
        !isTenant
    ) {
        res.status(403).json({
            message:
                'You are not authorized to use AI on this agreement'
        });

        return null;
    }

    if (
        !agreement.extractedText ||
        !agreement.extractedText.trim()
    ) {
        res.status(400).json({
            message:
                'No extracted agreement text is available for AI analysis'
        });

        return null;
    }

    return agreement;
};


// =====================================================
// AI SUMMARY
// =====================================================

const summarizeAgreement = async (
    req,
    res
) => {
    let agreement = null;

    try {
        agreement =
            await getAuthorizedAgreement(
                req,
                res
            );

        if (!agreement) {
            return;
        }

        const summary =
            await generateAgreementSummary(
                agreement.extractedText
            );

        const analysis =
            await AgreementAnalysis.create({
                agreement: agreement._id,
                user: req.user.id,
                type: 'summary',
                input: '',
                result: summary
            });

        await recordAIUsage({
            user: req.user.id,
            agreement: agreement._id,
            operation: 'summary',
            status: 'success'
        });

        await createActivityLog({
            userId: req.user.id,
            action: 'AI_SUMMARY',
            module: 'ai',
            description:
                'AI agreement summary generated',
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: {
                analysisId: analysis._id,
                operation: 'summary',
                model:
                    process.env.GEMINI_MODEL || ''
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Agreement summary generated successfully',
            agreementId: agreement._id,
            analysisId: analysis._id,
            summary
        });

    } catch (err) {
        console.error(
            'AI agreement summary error:',
            err.message
        );

        if (agreement) {
            await recordAIUsage({
                user: req.user.id,
                agreement: agreement._id,
                operation: 'summary',
                status: 'failed',
                errorMessage: err.message
            });

            await createActivityLog({
                userId: req.user.id,
                action: 'AI_SUMMARY',
                module: 'ai',
                description:
                    'AI agreement summary generation failed',
                targetType: 'Agreement',
                targetId: agreement._id,
                metadata: {
                    operation: 'summary',
                    error: err.message
                },
                req,
                status: 'failed'
            });
        }

        return res.status(500).json({
            message:
                'Failed to generate agreement summary',
            error: err.message
        });
    }
};


// =====================================================
// EXPLAIN CLAUSE
// =====================================================

const explainAgreementClause = async (
    req,
    res
) => {
    let agreement = null;

    try {
        agreement =
            await getAuthorizedAgreement(
                req,
                res
            );

        if (!agreement) {
            return;
        }

        const { clause } =
            req.body;

        if (
            !clause ||
            !clause.trim()
        ) {
            return res.status(400).json({
                message:
                    'clause is required'
            });
        }

        const explanation =
            await explainClause(
                agreement.extractedText,
                clause
            );

        const analysis =
            await AgreementAnalysis.create({
                agreement: agreement._id,
                user: req.user.id,
                type:
                    'clause_explanation',
                input: clause.trim(),
                result: explanation
            });

        await recordAIUsage({
            user: req.user.id,
            agreement: agreement._id,
            operation:
                'clause_explanation',
            status: 'success'
        });

        await createActivityLog({
            userId: req.user.id,
            action:
                'AI_CLAUSE_EXPLANATION',
            module: 'ai',
            description:
                'AI agreement clause explanation generated',
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: {
                analysisId: analysis._id,
                operation:
                    'clause_explanation',
                clause:
                    clause.trim(),
                model:
                    process.env.GEMINI_MODEL || ''
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Clause explanation generated successfully',
            agreementId:
                agreement._id,
            analysisId:
                analysis._id,
            clause:
                clause.trim(),
            explanation
        });

    } catch (err) {
        console.error(
            'AI clause explanation error:',
            err.message
        );

        if (agreement) {
            await recordAIUsage({
                user: req.user.id,
                agreement: agreement._id,
                operation:
                    'clause_explanation',
                status: 'failed',
                errorMessage:
                    err.message
            });

            await createActivityLog({
                userId: req.user.id,
                action:
                    'AI_CLAUSE_EXPLANATION',
                module: 'ai',
                description:
                    'AI clause explanation failed',
                targetType: 'Agreement',
                targetId: agreement._id,
                metadata: {
                    operation:
                        'clause_explanation',
                    error:
                        err.message
                },
                req,
                status: 'failed'
            });
        }

        return res.status(500).json({
            message:
                'Failed to explain clause',
            error: err.message
        });
    }
};


// =====================================================
// DETECT AGREEMENT RISKS
// =====================================================

const analyzeAgreementRisks = async (
    req,
    res
) => {
    let agreement = null;

    try {
        agreement =
            await getAuthorizedAgreement(
                req,
                res
            );

        if (!agreement) {
            return;
        }

        const risks =
            await detectAgreementRisks(
                agreement.extractedText
            );

        const analysis =
            await AgreementAnalysis.create({
                agreement: agreement._id,
                user: req.user.id,
                type: 'risk',
                input: '',
                result: risks
            });

        await recordAIUsage({
            user: req.user.id,
            agreement: agreement._id,
            operation:
                'risk_detection',
            status: 'success'
        });

        await createActivityLog({
            userId: req.user.id,
            action:
                'AI_RISK_DETECTION',
            module: 'ai',
            description:
                'AI agreement risk analysis completed',
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: {
                analysisId:
                    analysis._id,
                operation:
                    'risk_detection',
                model:
                    process.env.GEMINI_MODEL || ''
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Agreement risk analysis completed successfully',
            agreementId:
                agreement._id,
            analysisId:
                analysis._id,
            risks
        });

    } catch (err) {
        console.error(
            'AI risk detection error:',
            err.message
        );

        if (agreement) {
            await recordAIUsage({
                user: req.user.id,
                agreement: agreement._id,
                operation:
                    'risk_detection',
                status: 'failed',
                errorMessage:
                    err.message
            });

            await createActivityLog({
                userId: req.user.id,
                action:
                    'AI_RISK_DETECTION',
                module: 'ai',
                description:
                    'AI agreement risk analysis failed',
                targetType: 'Agreement',
                targetId: agreement._id,
                metadata: {
                    operation:
                        'risk_detection',
                    error:
                        err.message
                },
                req,
                status: 'failed'
            });
        }

        return res.status(500).json({
            message:
                'Failed to analyze agreement risks',
            error: err.message
        });
    }
};


// =====================================================
// ASK QUESTION
// =====================================================

const askAgreementQuestion = async (
    req,
    res
) => {
    let agreement = null;

    try {
        agreement =
            await getAuthorizedAgreement(
                req,
                res
            );

        if (!agreement) {
            return;
        }

        const { question } =
            req.body;

        if (
            !question ||
            !question.trim()
        ) {
            return res.status(400).json({
                message:
                    'question is required'
            });
        }

        const answer =
            await answerAgreementQuestion(
                agreement.extractedText,
                question
            );

        const analysis =
            await AgreementAnalysis.create({
                agreement: agreement._id,
                user: req.user.id,
                type: 'question',
                input: question.trim(),
                result: answer
            });

        await recordAIUsage({
            user: req.user.id,
            agreement: agreement._id,
            operation: 'question',
            status: 'success'
        });

        await createActivityLog({
            userId: req.user.id,
            action:
                'AI_QUESTION',
            module: 'ai',
            description:
                'AI answered a question about an agreement',
            targetType: 'Agreement',
            targetId: agreement._id,
            metadata: {
                analysisId:
                    analysis._id,
                operation:
                    'question',
                question:
                    question.trim(),
                model:
                    process.env.GEMINI_MODEL || ''
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Agreement question answered successfully',
            agreementId:
                agreement._id,
            analysisId:
                analysis._id,
            question:
                question.trim(),
            answer
        });

    } catch (err) {
        console.error(
            'AI agreement question error:',
            err.message
        );

        if (agreement) {
            await recordAIUsage({
                user: req.user.id,
                agreement: agreement._id,
                operation:
                    'question',
                status: 'failed',
                errorMessage:
                    err.message
            });

            await createActivityLog({
                userId: req.user.id,
                action:
                    'AI_QUESTION',
                module: 'ai',
                description:
                    'AI agreement question failed',
                targetType: 'Agreement',
                targetId: agreement._id,
                metadata: {
                    operation:
                        'question',
                    error:
                        err.message
                },
                req,
                status: 'failed'
            });
        }

        return res.status(500).json({
            message:
                'Failed to answer agreement question',
            error: err.message
        });
    }
};


// =====================================================
// GET COMPLETE AI ANALYSIS HISTORY
// =====================================================

const getAgreementAnalysisHistory =
    async (req, res) => {
        try {
            const agreement =
                await getAuthorizedAgreement(
                    req,
                    res
                );

            if (!agreement) {
                return;
            }

            const analyses =
                await AgreementAnalysis.find({
                    agreement:
                        agreement._id
                })
                    .populate(
                        'user',
                        'name email role'
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.json({
                agreementId:
                    agreement._id,
                count:
                    analyses.length,
                analyses
            });

        } catch (err) {
            console.error(
                'Get AI analysis history error:',
                err.message
            );

            return res.status(500).json({
                message:
                    'Failed to get AI analysis history'
            });
        }
    };


// =====================================================
// GET LATEST SUMMARY
// =====================================================

const getLatestSummary = async (
    req,
    res
) => {
    try {
        const agreement =
            await getAuthorizedAgreement(
                req,
                res
            );

        if (!agreement) {
            return;
        }

        const analysis =
            await AgreementAnalysis.findOne({
                agreement:
                    agreement._id,
                type: 'summary'
            })
                .populate(
                    'user',
                    'name email role'
                )
                .sort({
                    createdAt: -1
                });

        if (!analysis) {
            return res.status(404).json({
                message:
                    'No summary has been generated for this agreement yet'
            });
        }

        return res.json({
            agreementId:
                agreement._id,
            analysisId:
                analysis._id,
            type:
                analysis.type,
            summary:
                analysis.result,
            generatedBy:
                analysis.user,
            createdAt:
                analysis.createdAt
        });

    } catch (err) {
        console.error(
            'Get latest summary error:',
            err.message
        );

        return res.status(500).json({
            message:
                'Failed to get latest agreement summary'
        });
    }
};


// =====================================================
// GET LATEST RISK ANALYSIS
// =====================================================

const getLatestRisks = async (
    req,
    res
) => {
    try {
        const agreement =
            await getAuthorizedAgreement(
                req,
                res
            );

        if (!agreement) {
            return;
        }

        const analysis =
            await AgreementAnalysis.findOne({
                agreement:
                    agreement._id,
                type: 'risk'
            })
                .populate(
                    'user',
                    'name email role'
                )
                .sort({
                    createdAt: -1
                });

        if (!analysis) {
            return res.status(404).json({
                message:
                    'No risk analysis has been generated for this agreement yet'
            });
        }

        return res.json({
            agreementId:
                agreement._id,
            analysisId:
                analysis._id,
            type:
                analysis.type,
            risks:
                analysis.result,
            generatedBy:
                analysis.user,
            createdAt:
                analysis.createdAt
        });

    } catch (err) {
        console.error(
            'Get latest risks error:',
            err.message
        );

        return res.status(500).json({
            message:
                'Failed to get latest agreement risks'
        });
    }
};


module.exports = {
    summarizeAgreement,
    explainAgreementClause,
    analyzeAgreementRisks,
    askAgreementQuestion,
    getAgreementAnalysisHistory,
    getLatestSummary,
    getLatestRisks
};