const ActivityLog = require('../models/ActivityLog');

const getActivityLogs = async (req, res) => {
  try {
    const {
      action,
      module,
      status,
      userId,
      targetType,
      page = 1,
      limit = 25
    } = req.query;

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (module) {
      filter.module = module;
    }

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.user = userId;
    }

    if (targetType) {
      filter.targetType = targetType;
    }

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 25, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const [
      logs,
      total
    ] = await Promise.all([
      ActivityLog.find(filter)
        .populate(
          'user',
          'name email role'
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limitNumber),

      ActivityLog.countDocuments(filter)
    ]);

    return res.json({
      logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        )
      }
    });

  } catch (error) {
    console.error(
      'Get activity logs error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getActivityLogStats = async (req, res) => {
  try {
    const [
      total,
      successful,
      failed
    ] = await Promise.all([
      ActivityLog.countDocuments(),

      ActivityLog.countDocuments({
        status: 'success'
      }),

      ActivityLog.countDocuments({
        status: 'failed'
      })
    ]);

    const actionStats =
      await ActivityLog.aggregate([
        {
          $group: {
            _id: '$action',
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);

    const moduleStats =
      await ActivityLog.aggregate([
        {
          $group: {
            _id: '$module',
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);

    return res.json({
      total,
      successful,
      failed,

      actions: actionStats.map(
        (item) => ({
          action: item._id,
          count: item.count
        })
      ),

      modules: moduleStats.map(
        (item) => ({
          module: item._id,
          count: item.count
        })
      )
    });

  } catch (error) {
    console.error(
      'Activity log stats error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getActivityLogById = async (req, res) => {
  try {
    const log =
      await ActivityLog.findById(
        req.params.id
      ).populate(
        'user',
        'name email role phone'
      );

    if (!log) {
      return res.status(404).json({
        message: 'Activity log not found'
      });
    }

    return res.json({
      log
    });

  } catch (error) {
    console.error(
      'Get activity log details error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  getActivityLogs,
  getActivityLogStats,
  getActivityLogById
};
