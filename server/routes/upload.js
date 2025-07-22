import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import imageOptimizer from '../services/imageOptimizer.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Configure multer for memory storage (for processing before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload and optimize single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const options = {
      maxWidth: parseInt(req.body.maxWidth) || 800,
      maxHeight: parseInt(req.body.maxHeight) || 800,
      quality: parseInt(req.body.quality) || 80,
      formats: req.body.formats ? req.body.formats.split(',') : ['webp', 'jpeg'],
      thumbnail: req.body.thumbnail !== 'false'
    };

    const result = await imageOptimizer.optimizeImage(req.file, options);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to optimize image',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Upload and optimize multiple images
router.post('/images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const options = {
      maxWidth: parseInt(req.body.maxWidth) || 800,
      maxHeight: parseInt(req.body.maxHeight) || 800,
      quality: parseInt(req.body.quality) || 80,
      formats: req.body.formats ? req.body.formats.split(',') : ['webp'],
      thumbnail: req.body.thumbnail !== 'false'
    };

    const results = await imageOptimizer.optimizeMultipleImages(req.files, options);

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    res.json({
      success: true,
      message: `Processed ${results.length} images. ${successCount} successful, ${failedCount} failed.`,
      data: results
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Create image variants (small, medium, large)
router.post('/variants', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const customVariants = {};
    if (req.body.variants) {
      try {
        const variants = JSON.parse(req.body.variants);
        Object.assign(customVariants, variants);
      } catch (e) {
        console.error('Invalid variants JSON:', e);
      }
    }

    const results = await imageOptimizer.createImageVariants(req.file, customVariants);

    res.json({
      success: true,
      message: 'Image variants created successfully',
      data: results
    });

  } catch (error) {
    console.error('Variants creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create variants',
      error: error.message
    });
  }
});

// Delete image
router.delete('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await imageOptimizer.deleteImage(filename);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Image not found or could not be deleted',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

// Get image info
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(imageOptimizer.uploadDir, filename);
    
    const result = await imageOptimizer.getImageInfo(filepath);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image info',
      error: error.message
    });
  }
});

// Serve static files
router.use('/uploads', express.static('uploads'));

export default router; 