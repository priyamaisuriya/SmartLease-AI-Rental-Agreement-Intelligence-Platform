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
    // Optional time window: ?days=7|30|180|365 (default: all time)
    const days = parseInt(req.query.days, 10);
    const match = {};

    if (days > 0 && days <= 3650) {
      match.createdAt = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      };
    }

    const [byOperation, byStatus, daily, topUsers] = await Promise.all([
      AIUsage.aggregate([
        { $match: match },
        { $group: { _id: '$operation', count: { $sum: 1 } } }
      ]),

      AIUsage.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      AIUsage.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: 1 },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      AIUsage.aggregate([
        { $match: match },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { count: 1, name: '$user.name', email: '$user.email' } }
      ])
    ]);

    const operations = Object.fromEntries(
      ['summary', 'risk_detection', 'clause_explanation', 'question', 'conditions_analysis', 'document_chat']
        .map((op) => [op, 0])
    );
    byOperation.forEach((o) => {
      operations[o._id] = o.count;
    });

    const statusCount = (st) => (byStatus.find((x) => x._id === st) || {}).count || 0;
    const successful = statusCount('success');
    const failed = statusCount('failed');
    const total = successful + failed;

    return res.json({
      days: days > 0 ? days : null,
      total,
      successful,
      failed,
      successRate: total ? Math.round((successful / total) * 1000) / 10 : null,
      operations,
      daily: daily.map((d) => ({ date: d._id, total: d.total, failed: d.failed })),
      topUsers: topUsers.map((u) => ({ name: u.name || 'Unknown', email: u.email || '', count: u.count }))
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
