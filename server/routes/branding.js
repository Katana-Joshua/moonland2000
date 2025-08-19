import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ===== BUSINESS SETTINGS ROUTES =====

// Get business settings
router.get('/business-settings', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM business_settings ORDER BY id DESC LIMIT 1');
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch business settings'
      });
    }

    // Return default settings if none exist
    const settings = result.data.length > 0 ? result.data[0] : {
      business_type: 'general',
      business_name: 'Moon Land POS',
      slogan: 'Your Launchpad for Effortless Sales',
      address: '123 Cosmic Way, Galaxy City',
      phone: '+123 456 7890',
      email: 'info@moonland.com',
      website: 'www.moonland.com',
      tax_rate: 0.00,
      currency: 'UGX',
      timezone: 'Africa/Kampala'
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get business settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update business settings
router.put('/business-settings', authenticateToken, requireAdmin, [
  body('business_type').optional().isString(),
  body('business_name').optional().isString(),
  body('slogan').optional().isString(),
  body('address').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  body('website').optional().isString(),
  body('tax_rate').optional().isFloat({ min: 0, max: 100 }),
  body('currency').optional().isString(),
  body('timezone').optional().isString()
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

    const {
      business_type,
      business_name,
      slogan,
      address,
      phone,
      email,
      website,
      tax_rate,
      currency,
      timezone
    } = req.body;

    // Check if settings exist
    const existingSettings = await executeQuery('SELECT id FROM business_settings ORDER BY id DESC LIMIT 1');
    
    let result;
    if (existingSettings.success && existingSettings.data.length > 0) {
      // Update existing settings
      const updateFields = [];
      const params = [];
      
      if (business_type !== undefined) { updateFields.push('business_type = ?'); params.push(business_type); }
      if (business_name !== undefined) { updateFields.push('business_name = ?'); params.push(business_name); }
      if (slogan !== undefined) { updateFields.push('slogan = ?'); params.push(slogan); }
      if (address !== undefined) { updateFields.push('address = ?'); params.push(address); }
      if (phone !== undefined) { updateFields.push('phone = ?'); params.push(phone); }
      if (email !== undefined) { updateFields.push('email = ?'); params.push(email); }
      if (website !== undefined) { updateFields.push('website = ?'); params.push(website); }
      if (tax_rate !== undefined) { updateFields.push('tax_rate = ?'); params.push(tax_rate); }
      if (currency !== undefined) { updateFields.push('currency = ?'); params.push(currency); }
      if (timezone !== undefined) { updateFields.push('timezone = ?'); params.push(timezone); }

      if (updateFields.length > 0) {
        result = await executeQuery(`
          UPDATE business_settings 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `, [...params, existingSettings.data[0].id]);
      }
    } else {
      // Create new settings
      result = await executeQuery(`
        INSERT INTO business_settings (
          business_type, business_name, slogan, address, phone, email, website, tax_rate, currency, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        business_type || 'general',
        business_name || 'Moon Land POS',
        slogan || 'Your Launchpad for Effortless Sales',
        address || '123 Cosmic Way, Galaxy City',
        phone || '+123 456 7890',
        email || 'info@moonland.com',
        website || 'www.moonland.com',
        tax_rate || 0.00,
        currency || 'UGX',
        timezone || 'Africa/Kampala'
      ]);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update business settings'
      });
    }

    res.json({
      success: true,
      message: 'Business settings updated successfully'
    });
  } catch (error) {
    console.error('Update business settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== BRANDING ASSETS ROUTES =====

// Get branding assets
router.get('/branding-assets', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM branding_assets ORDER BY asset_type');
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch branding assets'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get branding assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload branding asset (logo, favicon, etc.)
router.post('/branding-assets', authenticateToken, requireAdmin, upload.single('asset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { asset_type } = req.body;
    
    if (!asset_type || !['logo', 'favicon', 'receipt_header', 'receipt_footer'].includes(asset_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset type'
      });
    }

    // Check if asset of this type already exists
    const existingAsset = await executeQuery(
      'SELECT id FROM branding_assets WHERE asset_type = ?',
      [asset_type]
    );

    let result;
    if (existingAsset.success && existingAsset.data.length > 0) {
      // Update existing asset
      result = await executeQuery(`
        UPDATE branding_assets 
        SET file_name = ?, file_data = ?, mime_type = ?, file_size = ?
        WHERE asset_type = ?
      `, [
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
        req.file.size,
        asset_type
      ]);
    } else {
      // Create new asset
      result = await executeQuery(`
        INSERT INTO branding_assets (asset_type, file_name, file_data, mime_type, file_size)
        VALUES (?, ?, ?, ?, ?)
      `, [
        asset_type,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
        req.file.size
      ]);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save branding asset'
      });
    }

    res.json({
      success: true,
      message: 'Branding asset uploaded successfully'
    });
  } catch (error) {
    console.error('Upload branding asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific branding asset (for display)
router.get('/branding-assets/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['logo', 'favicon', 'receipt_header', 'receipt_footer'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset type'
      });
    }

    const result = await executeQuery(
      'SELECT * FROM branding_assets WHERE asset_type = ?',
      [type]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const asset = result.data[0];
    
    // Set appropriate headers for image display
    res.set('Content-Type', asset.mime_type);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(asset.file_data);
  } catch (error) {
    console.error('Get branding asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete branding asset
router.delete('/branding-assets/:type', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['logo', 'favicon', 'receipt_header', 'receipt_footer'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset type'
      });
    }

    const result = await executeQuery(
      'DELETE FROM branding_assets WHERE asset_type = ?',
      [type]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete branding asset'
      });
    }

    res.json({
      success: true,
      message: 'Branding asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete branding asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
