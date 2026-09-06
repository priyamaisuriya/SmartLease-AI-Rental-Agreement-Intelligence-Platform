const AIUsage = require('../models/AIUsage');

const getAIUsage = async (req, res) => {
  try {
    const {
      operation,
      status,
      userId,
      limit = 50,
      page = 1
    } = req.query;

    const filter = {};

    if (operation) {
      filter.operation = operation;
    }

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.user = userId;
    }

    const parsedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 50, 1),
      100
    );

    const parsedPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const skip =
      (parsedPage - 1) * parsedLimit;

    const [usage, total] = await Promise.all([
      AIUsage.find(filter)
        .populate('user', 'name email role')
        .populate(
          'agreement',
          'title originalFileName status'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),

      AIUsage.countDocuments(filter)
    ]);

    return res.json({
      count: usage.length,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(
        total / parsedLimit
      ),
      usage
    });

  } catch (err) {
    console.error(
      'Get AI usage error:',
      err.message
    );

    return res.status(500).json({
      message: 'Failed to get AI usage'
    });
  }
};


const getAIUsageStats = async (req, res) => {
  try {
    const [
      total,
      successful,
      failed,
      summaries,
      risks,
      clauseExplanations,
      questions
    ] = await Promise.all([
      AIUsage.countDocuments(),

      AIUsage.countDocuments({
        status: 'success'
      }),

      AIUsage.countDocuments({
        status: 'failed'
      }),

      AIUsage.countDocuments({
        operation: 'summary'
      }),

      AIUsage.countDocuments({
        operation: 'risk_detection'
      }),

      AIUsage.countDocuments({
        operation: 'clause_explanation'
      }),

      AIUsage.countDocuments({
        operation: 'question'
      })
    ]);

    return res.json({
      total,
      successful,
      failed,

      operations: {
        summary: summaries,
        riskDetection: risks,
        clauseExplanation: clauseExplanations,
        questions
      }
    });

  } catch (err) {
    console.error(
      'Get AI usage stats error:',
      err.message
    );

    return res.status(500).json({
      message: 'Failed to get AI usage statistics'
    });
  }
};


module.exports = {
  getAIUsage,
  getAIUsageStats
};
