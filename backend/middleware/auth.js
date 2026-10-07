const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check token
  if (!token) {
    return res.status(401).json({
      message: 'No token, authorization denied'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret123'
    );

    // Check decoded user
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({
        message: 'Invalid token payload'
      });
    }

    // Store user information in request
    req.user = decoded.user;

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);

    return res.status(401).json({
      message: 'Token is not valid'
    });
  }
};