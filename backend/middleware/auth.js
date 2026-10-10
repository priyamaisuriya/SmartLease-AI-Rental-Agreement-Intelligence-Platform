const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { getJwtSecret } = require('../utils/jwtSecret');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check token
  if (!token) {
    return res.status(401).json({
      message: 'No token, authorization denied'
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (err) {
    console.error('JWT verification error:', err.message);

    return res.status(401).json({
      message: 'Token is not valid'
    });
  }

  // Check decoded user
  if (!decoded || !decoded.user || !decoded.user.id) {
    return res.status(401).json({
      message: 'Invalid token payload'
    });
  }

  try {
    // Role and active flag come from the database, not from the token, so a
    // deactivated user or a changed role takes effect immediately.
    const user = await User.findById(decoded.user.id).select('role isActive');

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: 'Your account is inactive'
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};
