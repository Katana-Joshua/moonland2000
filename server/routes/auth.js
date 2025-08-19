import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// CORS middleware for auth routes
router.use((req, res, next) => {
  console.log('🔐 Auth route CORS middleware:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
  
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  
  // Log the headers being set
  console.log('📋 CORS headers set:', {
    'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers')
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

// Handle OPTIONS preflight for all auth routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Login route
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  console.log('🔐 Login attempt:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    contentType: req.headers['content-type'],
    hasBody: !!req.body,
    username: req.body?.username ? '***' : 'missing'
  });
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Login validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find user by username and get staff information
    const result = await executeQuery(`
      SELECT u.id, u.username, u.password_hash, u.role, s.name, s.email
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.username = ?
    `, [username]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (result.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.data[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user data (without password) and token
    const { password_hash, ...userData } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register route (admin only)
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password, role } = req.body;

    // Check if username already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await executeQuery(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordHash, role]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.data.insertId,
        username,
        role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh token route
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Since we're using authenticateToken middleware, if we reach here, the token is valid
    // We'll generate a new token with the same user data
    const user = req.user;
    
    // Generate new JWT token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // This route should be protected by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await executeQuery(`
      SELECT u.id, u.username, u.role, u.created_at, s.name, s.email
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.id = ?
    `, [req.user.id]);

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password route
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const userResult = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.data[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updateResult = await executeQuery(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 