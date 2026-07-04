// ============================================
// JWT Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Middleware to authenticate incoming requests via JWT.
 *
 * Expects the `Authorization` header in the format:
 *   Authorization: Bearer <token>
 *
 * On success, attaches the decoded payload to `req.user`:
 *   { id, employee_id, email, role }
 */
const auth = (req, res, next) => {
  try {
    // 1. Read the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 2. Extract the token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 3. Verify the token against our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach decoded payload to the request object
    // Payload contains: id, employee_id, email, role
    req.user = decoded;

    next();
  } catch (err) {
    // Token is expired, malformed, or signature doesn't match
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = auth;
