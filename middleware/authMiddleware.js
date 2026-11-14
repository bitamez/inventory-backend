import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role_id !== 1) {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
  next();
};

export const isManager = (req, res, next) => {
  if (req.user?.role_id > 2) {
    return res.status(403).json({ success: false, message: 'Access denied: Managers only' });
  }
  next();
};

export const isAdminOrManager = (req, res, next) => {
  if (req.user?.role_id > 2) {
    return res.status(403).json({ success: false, message: 'Access denied: Admins and Managers only' });
  }
  next();
};

export const requireAuth = verifyToken;
