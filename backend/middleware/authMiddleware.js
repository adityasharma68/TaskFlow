// middleware/authMiddleware.js
// ============================================================
// JWT Auth Middleware – Protects routes that require login.
// Attaches the decoded user payload to req.user.
// ============================================================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Expect:  Authorization: Bearer <token>
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token. Please log in.';
    return res.status(401).json({ success: false, message });
  }
};

module.exports = authMiddleware;
