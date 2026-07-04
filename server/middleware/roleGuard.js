// ============================================
// Role-Based Access Control Middleware Factory
// ============================================

/**
 * Creates middleware that restricts access to users with the specified role(s).
 *
 * Usage (single role):
 *   router.get('/admin-only', auth, roleGuard('admin'), handler);
 *
 * Usage (multiple roles):
 *   router.get('/managers', auth, roleGuard(['admin', 'manager']), handler);
 *
 * IMPORTANT: Must be used AFTER the auth middleware so that
 * `req.user` is already populated with the decoded JWT payload.
 *
 * @param {string|string[]} requiredRole - A single role or array of allowed roles
 * @returns {Function} Express middleware
 */
const roleGuard = (requiredRole) => {
  return (req, res, next) => {
    // Ensure auth middleware ran first and populated req.user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Normalise to an array so we can handle both single and multiple roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Check if the user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = roleGuard;
