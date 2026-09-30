const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token from Authorization header
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.trim().toLowerCase().startsWith('bearer ')) {
    try {
      token = authHeader.trim().substring(7).trim();
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_hrms_2026_pro_secure_token');
      
      const user = await User.findById(decoded.id).populate('employeeId');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User session expired or user no longer exists' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      req.user = user;
      return next();
    } catch (err) {
      console.error('Auth verification error:', err.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided. Please log in.' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not permitted to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
