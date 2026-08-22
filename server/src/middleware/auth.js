import jwt from 'jsonwebtoken';
import db from '../db/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-hrms-super-secret-key-2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Session expired or invalid token.' });
    }

    const employees = db.getCollection('employees');
    const user = employees.find(e => e.id === decoded.id || e.email === decoded.email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      designation: user.designation
    };
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin/HR Officer privilege required.' });
  }
};
