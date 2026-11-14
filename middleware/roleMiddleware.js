
export const requireRole = (...allowedRoleIds) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Not authenticated' });
    }
    if (!allowedRoleIds.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Insufficient permissions',
      });
    }
    next();
  };
};

export const isAdmin     = requireRole(1);
export const isManager   = requireRole(1, 2);
export const isSalesOrAbove = requireRole(1, 2, 3);
