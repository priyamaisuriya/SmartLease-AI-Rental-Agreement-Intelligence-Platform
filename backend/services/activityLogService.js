const ActivityLog = require('../models/ActivityLog');

const createActivityLog = async ({
  userId = null,
  action,
  module,
  description = '',
  targetType = '',
  targetId = null,
  metadata = {},
  req = null,
  status = 'success'
}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      module,
      description,
      targetType,
      targetId,
      metadata,
      ipAddress: req
        ? (
            req.headers['x-forwarded-for'] ||
            req.socket?.remoteAddress ||
            ''
          )
        : '',
      userAgent: req
        ? req.headers['user-agent'] || ''
        : '',
      status
    });
  } catch (error) {
    // Logging failure must never break the main application.
    console.error(
      'Activity log error:',
      error.message
    );
  }
};

module.exports = {
  createActivityLog
};
