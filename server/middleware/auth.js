import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  console.log('🔐 Auth middleware - Headers:', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth middleware - Token:', token ? 'Token exists' : 'No token');

  if (!token) {
    console.log('❌ Auth middleware - No token provided');
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    console.log('🔐 Auth middleware - Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Auth middleware - Token decoded:', decoded);
    
    // Verify user still exists in database
    const result = await executeQuery(`
      SELECT u.id, u.username, u.role, s.name, s.email
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.id = ?
    `, [decoded.userId]);

    if (!result.success || result.data.length === 0) {
      console.log('❌ Auth middleware - User not found in database');
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Auth middleware - User authenticated:', result.data[0]);
    req.user = result.data[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireCashier = requireRole(['cashier', 'admin']); 