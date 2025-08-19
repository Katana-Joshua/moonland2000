import express from 'express';
import { executeQuery } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads - use disk storage temporarily like inventory system
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'branding-temp');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const assetType = req.body.asset_type;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${assetType}_${timestamp}${ext}`);
  }
});
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
  console.log('🌐 GET /business-settings called:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
  
  try {
    console.log('🔍 Querying business_settings table...');
    const result = await executeQuery('SELECT * FROM business_settings ORDER BY id DESC LIMIT 1');
    
    console.log('📊 Query result:', {
      success: result.success,
      dataLength: result.data ? result.data.length : 'no data',
      error: result.error || 'none'
    });
    
    if (!result.success) {
      console.error('❌ Database query failed:', result.message);
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
    
    console.log('✅ Returning business settings:', {
      business_name: settings.business_name,
      slogan: settings.slogan,
      business_type: settings.business_type
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Get business settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update business settings
router.put('/business-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Only validate fields that are present in the request
    const validationErrors = [];
    
    if (req.body.business_type !== undefined && typeof req.body.business_type !== 'string') {
      validationErrors.push({ field: 'business_type', message: 'Business type must be a string' });
    }
    
    if (req.body.business_name !== undefined && typeof req.body.business_name !== 'string') {
      validationErrors.push({ field: 'business_name', message: 'Business name must be a string' });
    }
    
    if (req.body.slogan !== undefined && typeof req.body.slogan !== 'string') {
      validationErrors.push({ field: 'slogan', message: 'Slogan must be a string' });
    }
    
    if (req.body.address !== undefined && typeof req.body.address !== 'string') {
      validationErrors.push({ field: 'address', message: 'Address must be a string' });
    }
    
    if (req.body.phone !== undefined && typeof req.body.phone !== 'string') {
      validationErrors.push({ field: 'phone', message: 'Phone must be a string' });
    }
    
    if (req.body.email !== undefined && req.body.email !== null && req.body.email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        validationErrors.push({ field: 'email', message: 'Invalid email format' });
      }
    }
    
    if (req.body.website !== undefined && req.body.website !== null && typeof req.body.website !== 'string') {
      validationErrors.push({ field: 'website', message: 'Website must be a string' });
    }
    
    if (req.body.tax_rate !== undefined && req.body.tax_rate !== null && (isNaN(req.body.tax_rate) || req.body.tax_rate < 0 || req.body.tax_rate > 100)) {
      validationErrors.push({ field: 'tax_rate', message: 'Tax rate must be a number between 0 and 100' });
    }
    
    if (req.body.currency !== undefined && req.body.currency !== null && typeof req.body.currency !== 'string') {
      validationErrors.push({ field: 'currency', message: 'Currency must be a string' });
    }
    
    if (req.body.timezone !== undefined && req.body.timezone !== null && typeof req.body.timezone !== 'string') {
      validationErrors.push({ field: 'timezone', message: 'Timezone must be a string' });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
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

    // Convert empty strings to null for database storage
    const processField = (value) => {
      if (value === '' || value === undefined) return null;
      return value;
    };

    const processedData = {
      business_type: processField(business_type),
      business_name: processField(business_name),
      slogan: processField(slogan),
      address: processField(address),
      phone: processField(phone),
      email: processField(email),
      website: processField(website),
      tax_rate: processField(tax_rate),
      currency: processField(currency),
      timezone: processField(timezone)
    };

    // Check if settings exist
    const existingSettings = await executeQuery('SELECT id FROM business_settings ORDER BY id DESC LIMIT 1');
    
    let result;
    if (existingSettings.success && existingSettings.data.length > 0) {
      // Update existing settings
      const updateFields = [];
      const params = [];
      
      if (processedData.business_type !== undefined) { updateFields.push('business_type = ?'); params.push(processedData.business_type); }
      if (processedData.business_name !== undefined) { updateFields.push('business_name = ?'); params.push(processedData.business_name); }
      if (processedData.slogan !== undefined) { updateFields.push('slogan = ?'); params.push(processedData.slogan); }
      if (processedData.address !== undefined) { updateFields.push('address = ?'); params.push(processedData.address); }
      if (processedData.phone !== undefined) { updateFields.push('phone = ?'); params.push(processedData.phone); }
      if (processedData.email !== undefined) { updateFields.push('email = ?'); params.push(processedData.email); }
      if (processedData.website !== undefined) { updateFields.push('website = ?'); params.push(processedData.website); }
      if (processedData.tax_rate !== undefined) { updateFields.push('tax_rate = ?'); params.push(processedData.tax_rate); }
      if (processedData.currency !== undefined) { updateFields.push('currency = ?'); params.push(processedData.currency); }
      if (processedData.timezone !== undefined) { updateFields.push('timezone = ?'); params.push(processedData.timezone); }

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
        processedData.business_type || 'general',
        processedData.business_name || 'Moon Land POS',
        processedData.slogan || 'Your Launchpad for Effortless Sales',
        processedData.address || '123 Cosmic Way, Galaxy City',
        processedData.phone || '+123 456 7890',
        processedData.email || 'info@moonland.com',
        processedData.website || 'www.moonland.com',
        processedData.tax_rate || 0.00,
        processedData.currency || 'UGX',
        processedData.timezone || 'Africa/Kampala'
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
  console.log('🌐 GET /branding-assets called:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
  
  try {
    console.log('🔍 Querying branding_assets table...');
    const result = await executeQuery('SELECT * FROM branding_assets ORDER BY asset_type');
    
    console.log('📊 Query result:', {
      success: result.success,
      dataLength: result.data ? result.data.length : 'no data',
      error: result.error || 'none'
    });
    
    if (!result.success) {
      console.error('❌ Database query failed:', result.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch branding assets'
      });
    }

    console.log('✅ Returning branding assets:', {
      count: result.data.length,
      types: result.data.map(asset => asset.asset_type)
    });

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get branding assets error:', error);
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

    // Handle image upload - store as BLOB like inventory system
    let imageData = null;
    try {
      imageData = fs.readFileSync(req.file.path);
      console.log('📁 Branding image file size:', imageData.length, 'bytes');
      fs.unlinkSync(req.file.path); // Clean up temp file
      console.log('  ✅ Branding image uploaded as BLOB');
    } catch (error) {
      console.error('❌ Error reading branding image file:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing image file'
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
        imageData,
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
        imageData,
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

// Get specific branding asset (for display) - serves BLOB data directly
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
    
    if (!asset.file_data) {
      return res.status(404).json({
        success: false,
        message: 'No image data found'
      });
    }

    // Detect image type (JPEG, PNG, GIF, WEBP) like inventory system
    let contentType = 'image/jpeg';
    if (asset.file_data[0] === 0x89 && asset.file_data[1] === 0x50 && asset.file_data[2] === 0x4E && asset.file_data[3] === 0x47) {
      contentType = 'image/png';
    } else if (asset.file_data[0] === 0x47 && asset.file_data[1] === 0x49 && asset.file_data[2] === 0x46) {
      contentType = 'image/gif';
    } else if (asset.file_data[0] === 0x52 && asset.file_data[1] === 0x49 && asset.file_data[2] === 0x46 && asset.file_data[3] === 0x46) {
      contentType = 'image/webp';
    } else if (asset.file_data[0] === 0xFF && asset.file_data[1] === 0xD8 && asset.file_data[2] === 0xFF) {
      contentType = 'image/jpeg';
    }
    
    // Set appropriate headers for image display
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
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
