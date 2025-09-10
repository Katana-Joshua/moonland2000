// Test change for deployment - update by user request
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { testConnection } from './config/database.js';
import { serveOptimizedImage } from './middleware/imageOptimizer.js';

// Import routes
import authRoutes from './routes/auth.js';
import posRoutes from './routes/pos.js';
import accountingRoutes from './routes/accounting.js';
import uploadRoutes from './routes/upload.js';
import brandingRoutes from './routes/branding.js';
import currencyRoutes from './routes/currency.js';
import suppliersRoutes from './routes/suppliers.js';
import purchaseOrdersRoutes from './routes/purchaseOrders.js';
import stockMovementsRoutes from './routes/stockMovements.js';
import receiptTemplatesRoutes from './routes/receiptTemplates.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MANUAL CORS - Set headers on every request
app.use((req, res, next) => {
  // Set CORS headers manually for ALL requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle ALL OPTIONS requests manually
  if (req.method === 'OPTIONS') {
    console.log('🌐 MANUAL CORS: Handling OPTIONS request for:', req.url);
    res.status(200).end();
    return;
  }
  
  next();
});

// Security middleware - More permissive for CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'", "*"],
      fontSrc: ["'self'", "*"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "*"],
      frameSrc: ["'self'", "*"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images) - with manual CORS headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Don't compress images - they're already compressed
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.set('Content-Type', getContentType(filePath));
      // Explicitly disable compression for images
      res.set('Content-Encoding', 'identity');
    }
  }
}));

// Helper function to get content type
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return contentTypes[ext] || 'application/octet-stream';
};

// Health check endpoint with manual CORS
app.get('/health', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  res.status(200).json({
    success: true,
    message: 'Moon Land POS Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: 'MANUAL CORS - ALLOW ALL',
    corsCredentials: 'disabled',
    uptime: process.uptime(),
    headers: req.headers,
    origin: req.headers.origin
  });
});

// CORS test endpoint with manual CORS
app.get('/cors-test', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  res.json({
    success: true,
    message: 'MANUAL CORS test successful',
    origin: req.headers.origin,
    corsOrigin: 'MANUAL CORS - ALLOW ALL',
    corsCredentials: 'disabled',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Preflight test endpoint with manual CORS
app.options('/cors-test', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// CORS debugging endpoint with manual CORS
app.get('/debug-cors', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  res.json({
    success: true,
    message: 'MANUAL CORS debugging information',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      CORS_ORIGIN: 'MANUAL CORS - ALLOW ALL',
      CORS_CREDENTIALS: 'disabled',
      PORT: process.env.PORT
    },
    request: {
      method: req.method,
      url: req.url,
      origin: req.headers.origin,
      host: req.headers.host,
      userAgent: req.headers['user-agent'],
      accept: req.headers.accept,
      contentType: req.headers['content-type']
    },
    headers: req.headers,
    cors: {
      enabled: true,
      origin: 'MANUAL CORS - ALLOW ALL',
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD']
    }
  });
});

// Preflight for debug endpoint with manual CORS
app.options('/debug-cors', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Login CORS test endpoint with manual CORS
app.post('/login-test', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  
  res.json({
    success: true,
    message: 'MANUAL CORS login test successful',
    timestamp: new Date().toISOString(),
    method: req.method,
    origin: req.headers.origin,
    corsHeaders: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers')
    }
  });
});

// Preflight for login test with manual CORS
app.options('/login-test', (req, res) => {
  // Manual CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Fallback image endpoint for when database is not available
app.get('/api/pos/images/:id', (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Return a placeholder image response
  res.status(404).json({
    success: false,
    message: 'Image not available - database connection required',
    fallback: true
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);
app.use('/api/receipt-templates', receiptTemplatesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed, but starting server anyway for development...');
      console.warn('⚠️  Some features may not work without database connection.');
      console.warn('💡 To fix database connection:');
      console.warn('   1. Check if MySQL server is running on Hostinger');
      console.warn('   2. Verify remote connections are enabled in Hostinger control panel');
      console.warn('   3. Check firewall settings');
      console.warn('   4. Verify database credentials in .env file');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Moon Land POS Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌍 CORS Configuration: MANUAL CORS - BULLETPROOF`);
      console.log(`   - Origin: MANUAL CORS - ALLOW ALL (*)`);
      console.log(`   - Credentials: disabled`);
      console.log(`   - Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD`);
      console.log(`   - Headers: ALL HEADERS ALLOWED (*)`);
      console.log(`   - Preflight: MANUAL HANDLING - 24h cache`);
      console.log(`🔐 CORS Credentials: disabled`);
      console.log(`📝 Debug endpoints:`);
      console.log(`   - /health - Health check with MANUAL CORS`);
      console.log(`   - /cors-test - CORS test endpoint with MANUAL CORS`);
      console.log(`   - /debug-cors - Detailed CORS debugging with MANUAL CORS`);
      console.log(`   - /login-test - Login CORS test endpoint with MANUAL CORS`);
      console.log(`🔍 Environment Variables Check:`);
      console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
      console.log(`   - CORS_ORIGIN: MANUAL CORS - ALLOW ALL (*)`);
      console.log(`   - CORS_CREDENTIALS: disabled`);
      console.log(`   - PORT: ${process.env.PORT || 'NOT SET (using default: 5000)'}`);
      console.log(`🚨 MANUAL CORS MODE: ALL ROUTES WILL HAVE CORS HEADERS`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer(); 