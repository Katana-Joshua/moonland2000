import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery, executeTransaction } from '../config/database.js';
import { authenticateToken, requireCashier } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { optimizeImage } from '../middleware/imageOptimizer.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload directory based on route
    let uploadDir = 'uploads/inventory'; // default
    if (req.route && req.route.path && req.route.path.includes('categories')) {
      uploadDir = 'uploads/categories';
    }
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = req.route && req.route.path && req.route.path.includes('categories') ? 'category-' : 'item-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
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

// ===== PUBLIC ROUTES (images only, no authentication) =====
router.get('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Get image data from inventory
    const result = await executeQuery(`
      SELECT image_data FROM inventory WHERE id = ?
    `, [id]);

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageData = result.data[0].image_data;
    if (!imageData) {
      return res.status(404).json({
        success: false,
        message: 'No image data found'
      });
    }

    // Detect image type (JPEG, PNG, GIF, WEBP)
    let contentType = 'image/jpeg';
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47) {
      contentType = 'image/png';
    } else if (imageData[0] === 0x47 && imageData[1] === 0x49 && imageData[2] === 0x46) {
      contentType = 'image/gif';
    } else if (imageData[0] === 0x52 && imageData[1] === 0x49 && imageData[2] === 0x46 && imageData[3] === 0x46) {
      contentType = 'image/webp';
    } else if (imageData[0] === 0xFF && imageData[1] === 0xD8 && imageData[2] === 0xFF) {
      contentType = 'image/jpeg';
    }

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.send(imageData);
  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/category-images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeQuery(`
      SELECT image_data FROM categories WHERE id = ?
    `, [id]);
    if (!result.success || result.data.length === 0 || !result.data[0].image_data) {
      return res.status(404).json({
        success: false,
        message: 'Category image not found'
      });
    }
    const imageData = result.data[0].image_data;
    // Detect image type
    let contentType = 'image/jpeg';
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47) {
      contentType = 'image/png';
    } else if (imageData[0] === 0x47 && imageData[1] === 0x49 && imageData[2] === 0x46) {
      contentType = 'image/gif';
    } else if (imageData[0] === 0x52 && imageData[1] === 0x49 && imageData[2] === 0x46 && imageData[3] === 0x46) {
      contentType = 'image/webp';
    } else if (imageData[0] === 0xFF && imageData[1] === 0xD8 && imageData[2] === 0xFF) {
      contentType = 'image/jpeg';
    }
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.send(imageData);
  } catch (error) {
    console.error('Serve category image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== PROTECTED ROUTES (everything else requires authentication) =====
router.use(authenticateToken);
router.use(requireCashier);

// ===== INVENTORY ROUTES =====

// Get all inventory items
router.get('/inventory', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        i.id,
        i.name,
        i.description,
        i.price,
        i.cost_price as costPrice,
        i.min_price as minPrice,
        i.stock,
        i.low_stock_alert as lowStockAlert,
        i.category_id as categoryId,
        CASE WHEN i.image_data IS NOT NULL THEN CONCAT('/api/pos/images/', i.id) ELSE NULL END as image,
        i.created_at as createdAt,
        i.updated_at as updatedAt,
        c.name as category
      FROM inventory i 
      LEFT JOIN categories c ON i.category_id = c.id 
      ORDER BY i.name
    `);

    // Debug: Log the first few items to see what data we're getting
    if (result.success && result.data.length > 0) {
      console.log('📊 Inventory data sample:');
      result.data.slice(0, 3).forEach(item => {
        console.log(`  ${item.name}: image_url = "${item.image}"`);
      });
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add inventory item
router.post('/inventory', upload.single('image'), optimizeImage, [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
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

    const { name, description, price, costPrice, minPrice, stock, lowStockAlert, categoryId } = req.body;
    const id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Handle image upload - store as BLOB
    let imageData = null;
    if (req.file) {
      try {
        imageData = fs.readFileSync(req.file.path);
        console.log('📁 Inventory image file size:', imageData.length, 'bytes');
        fs.unlinkSync(req.file.path); // Clean up temp file
        console.log('✅ Inventory image processed successfully');
      } catch (error) {
        console.error('❌ Error reading inventory image file:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing image file'
        });
      }
    }

    // Ensure all parameters are properly defined (not undefined)
    const params = [
      id,
      name || '',
      description || null,
      price || 0,
      costPrice || 0,
      minPrice || null,
      stock || 0,
      lowStockAlert || 5,
      categoryId || null,
      imageData
    ];

    console.log('Add inventory params:', params);

    console.log('📊 Inserting inventory with image data size:', imageData ? imageData.length : 0, 'bytes');
    
    const result = await executeQuery(`
      INSERT INTO inventory (id, name, description, price, cost_price, min_price, stock, low_stock_alert, category_id, image_data) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    if (!result.success) {
      console.error('Database error:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add inventory item'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: { 
        id, 
        name, 
        price, 
        stock, 
        hasImage: !!imageData
      }
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update inventory item
router.put('/inventory/:id', upload.single('image'), optimizeImage, [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    console.log('📥 Update inventory request received:');
    console.log('  ID:', req.params.id);
    console.log('  Body:', req.body);
    console.log('  File:', req.file);
    console.log('  Headers:', req.headers);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, price, costPrice, minPrice, stock, lowStockAlert, categoryId } = req.body;

    // Handle image upload - store as BLOB
    let imageData = null;
    console.log('🖼️ Image upload handling:');
    console.log('  req.file:', req.file);
    if (req.file) {
      try {
        imageData = fs.readFileSync(req.file.path);
        console.log('📁 Inventory image file size:', imageData.length, 'bytes');
        fs.unlinkSync(req.file.path); // Clean up temp file
        console.log('  ✅ Inventory image uploaded as BLOB');
      } catch (error) {
        console.error('❌ Error reading inventory image file:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing image file'
        });
      }
    } else {
      console.log('  ❌ No image file received');
    }

    // Ensure all parameters are properly defined (not undefined)
    let query, params;
    if (imageData) {
      query = `
        UPDATE inventory 
        SET name = ?, description = ?, price = ?, cost_price = ?, min_price = ?, stock = ?, low_stock_alert = ?, category_id = ?, image_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [
        name || '',
        description || null,
        price || 0,
        costPrice || 0,
        minPrice || null,
        stock || 0,
        lowStockAlert || 5,
        categoryId || null,
        imageData,
        id
      ];
    } else {
      query = `
        UPDATE inventory 
        SET name = ?, description = ?, price = ?, cost_price = ?, min_price = ?, stock = ?, low_stock_alert = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [
        name || '',
        description || null,
        price || 0,
        costPrice || 0,
        minPrice || null,
        stock || 0,
        lowStockAlert || 5,
        categoryId || null,
        id
      ];
    }

    console.log('📊 Updating inventory with image data size:', imageData ? imageData.length : 0, 'bytes');
    console.log('Update inventory params:', params);

    const result = await executeQuery(query, params);

    if (!result.success) {
      console.error('Database error:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update inventory item'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Get the updated item to return in response
    const updatedItemResult = await executeQuery(`
      SELECT 
        i.id,
        i.name,
        i.description,
        i.price,
        i.cost_price as costPrice,
        i.min_price as minPrice,
        i.stock,
        i.low_stock_alert as lowStockAlert,
        i.category_id as categoryId,
        CASE WHEN i.image_data IS NOT NULL THEN CONCAT('/api/pos/images/', i.id) ELSE NULL END as image,
        i.created_at as createdAt,
        i.updated_at as updatedAt,
        c.name as category
      FROM inventory i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItemResult.success ? updatedItemResult.data[0] : null
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete inventory item
router.delete('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery('DELETE FROM inventory WHERE id = ?', [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete inventory item'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== SALES ROUTES =====

// Get all sales
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, status, receiptNumber } = req.query;
    let query = `
      SELECT s.*
      FROM sales s
    `;
    const conditions = [];
    const params = [];

    if (receiptNumber) {
      conditions.push('s.receipt_number = ?');
      params.push(receiptNumber);
    }
    if (startDate) {
      conditions.push('DATE(s.timestamp) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('DATE(s.timestamp) <= ?');
      params.push(endDate);
    }
    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY s.timestamp DESC';

    const result = await executeQuery(query, params);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales'
      });
    }

    // For each sale, fetch its items
    const salesWithItems = await Promise.all((result.data || []).map(async sale => {
      const itemsResult = await executeQuery(
        'SELECT item_id as id, item_name as name, quantity, price, cost_price as costPrice FROM sale_items WHERE sale_id = ?',
        [sale.id]
      );
      return {
        id: sale.id,
        receiptNumber: sale.receipt_number,
        total: parseFloat(sale.total),
        totalCost: parseFloat(sale.total_cost),
        profit: parseFloat(sale.profit),
        paymentMethod: sale.payment_method,
        customerInfo: {
          name: sale.customer_name,
          phone: sale.customer_phone,
        },
        status: sale.status,
        cashierName: sale.cashier_name,
        cashReceived: sale.cash_received ? parseFloat(sale.cash_received) : null,
        changeGiven: sale.change_given ? parseFloat(sale.change_given) : null,
        shiftId: sale.shift_id,
        timestamp: sale.timestamp,
        paidAt: sale.paid_at,
        items: itemsResult.success ? itemsResult.data : [],
      };
    }));

    res.json({
      success: true,
      data: salesWithItems
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Process a sale
router.post('/sales', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('paymentMethod').isIn(['cash', 'credit', 'momo', 'airtel', 'bank_deposit', 'credit_card']).withMessage('Invalid payment method'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number')
], async (req, res) => {
  try {
    console.log('🛒 Processing sale with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      items, 
      paymentMethod, 
      customerName, 
      customerPhone, 
      total, 
      totalCost, 
      profit, 
      cashReceived, 
      changeGiven, 
      shiftId,
      timestamp // Accept timestamp from frontend
    } = req.body;

    // Always use UTC ISO string for sale timestamp
    const saleTimestamp = timestamp || new Date().toISOString();

    console.log('📊 Sale calculations:', { total, totalCost, profit, cashReceived, changeGiven });

    // Map frontend payment methods to database format
    const paymentMethodMap = {
      'cash': 'cash',
      'credit': 'credit', 
      'momo': 'momo',
      'airtel': 'airtel',
      'bank_deposit': 'bank_deposit',
      'credit_card': 'credit_card'
    };
    
    const dbPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod;
    console.log('💳 Payment method mapping:', { frontend: paymentMethod, database: dbPaymentMethod });

    const saleId = `sale-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const receiptNumber = `RCP-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;

    console.log('🆔 Generated IDs:', { saleId, receiptNumber });

    // Use req.user if available, otherwise fallback to userId/username from body
    let cashierName = req.user?.username;
    if (!cashierName && req.body.username) {
      cashierName = req.body.username;
    }

    // Use transaction for sale processing
    const queries = [
      {
        query: `
          INSERT INTO sales (id, receipt_number, total, total_cost, profit, payment_method, customer_name, customer_phone, status, cashier_name, cash_received, change_given, shift_id, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          saleId, receiptNumber, total, totalCost, profit, dbPaymentMethod, 
          customerName || null, customerPhone || null, 
          dbPaymentMethod === 'credit' ? 'unpaid' : 'paid',
          cashierName, cashReceived || null, changeGiven || null, shiftId || null, saleTimestamp
        ]
      }
    ];

    console.log('📝 Sale items to process:', items.length);
    
    // Add sale items
    for (const item of items) {
      console.log('📦 Processing item:', { id: item.id, name: item.name, quantity: item.quantity, price: item.price, costPrice: item.costPrice });
      
      queries.push({
        query: `
          INSERT INTO sale_items (sale_id, item_id, item_name, quantity, price, cost_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        params: [saleId, item.id, item.name, item.quantity, item.price, item.costPrice || 0]
      });

      // Update inventory stock
      queries.push({
        query: 'UPDATE inventory SET stock = stock - ? WHERE id = ?',
        params: [item.quantity, item.id]
      });
    }

    console.log('🔄 Executing transaction with', queries.length, 'queries');
    const result = await executeTransaction(queries);

    if (!result.success) {
      console.error('❌ Transaction failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process sale: ' + result.error
      });
    }

    console.log('✅ Sale processed successfully');
    
    // Get the complete sale data for the response
    const saleResult = await executeQuery(`
      SELECT s.*, GROUP_CONCAT(CONCAT(si.item_name, '|', si.quantity, '|', si.price) SEPARATOR '||') as items_data
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [saleId]);

    let saleData = {
      id: saleId,
      receiptNumber,
      total,
      totalCost,
      profit,
      paymentMethod: dbPaymentMethod,
      customerName,
      customerPhone,
      status: dbPaymentMethod === 'credit' ? 'unpaid' : 'paid',
      cashierName: cashierName,
      cashReceived,
      changeGiven,
      timestamp: saleTimestamp, // Use Kampala time
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        costPrice: item.costPrice || 0
      }))
    };

    res.status(201).json({
      success: true,
      message: 'Sale processed successfully',
      data: saleData
    });
  } catch (error) {
    console.error('💥 Process sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
});

// Pay credit sale
router.put('/sales/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(`
      UPDATE sales 
      SET status = 'paid', paid_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'unpaid'
    `, [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update sale'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found or already paid'
      });
    }

    res.json({
      success: true,
      message: 'Credit sale paid successfully'
    });
  } catch (error) {
    console.error('Pay credit sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete sale (admin only)
router.delete('/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting sale ID:', id);

    // First, get the sale details to restore inventory
    const saleResult = await executeQuery(`
      SELECT s.*, GROUP_CONCAT(CONCAT(si.item_id, '|', si.quantity) SEPARATOR '||') as items_data
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);

    if (!saleResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sale details'
      });
    }

    if (saleResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    const sale = saleResult.data[0];
    const itemsData = sale.items_data ? sale.items_data.split('||') : [];

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // 1. Restore inventory stock for all items in the sale
      for (const itemData of itemsData) {
        const [itemId, quantity] = itemData.split('|');
        if (itemId && quantity) {
          const restoreResult = await executeQuery(`
            UPDATE inventory 
            SET stock = stock + ? 
            WHERE id = ?
          `, [parseInt(quantity), itemId]);

          if (!restoreResult.success) {
            throw new Error(`Failed to restore inventory for item ${itemId}`);
          }

          console.log(`✅ Restored ${quantity} units for item ${itemId}`);
        }
      }

      // 2. Delete sale items (cascade will handle this, but being explicit)
      const deleteItemsResult = await executeQuery('DELETE FROM sale_items WHERE sale_id = ?', [id]);
      if (!deleteItemsResult.success) {
        throw new Error('Failed to delete sale items');
      }

      // 3. Delete the sale
      const deleteSaleResult = await executeQuery('DELETE FROM sales WHERE id = ?', [id]);
      if (!deleteSaleResult.success) {
        throw new Error('Failed to delete sale');
      }

      if (deleteSaleResult.data.affectedRows === 0) {
        throw new Error('Sale not found');
      }

      // Commit transaction
      await executeQuery('COMMIT');

      console.log('✅ Sale deleted successfully:', { id, receiptNumber: sale.receipt_number });

      res.json({
        success: true,
        message: `Sale #${sale.receipt_number} deleted successfully. Inventory restored.`
      });

    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
});

// ===== SHIFTS ROUTES =====

// Start a shift
router.post('/shifts', [
  body('staffId').notEmpty().withMessage('Staff ID is required'),
  body('startingCash').isFloat({ min: 0 }).withMessage('Starting cash must be a positive number')
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

    const { staffId, startingCash } = req.body;
    const shiftId = `shift-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startTime = new Date().toISOString();

    // For now, we'll use the staffId directly as the staff_id
    // In a real system, you might want to create a staff record or link users to staff
    let actualStaffId = staffId;
    
    // If staffId is a number (user ID), we'll create a simple staff record
    if (!isNaN(staffId)) {
      // Check if staff record exists for this user
      const staffResult = await executeQuery('SELECT id FROM staff WHERE id = ?', [staffId]);
      if (!staffResult.success || staffResult.data.length === 0) {
        // Create a staff record for this user
        const createStaffResult = await executeQuery(`
          INSERT INTO staff (id, name, role, pin) 
          VALUES (?, ?, 'Cashier', '0000')
        `, [staffId, `User ${staffId}`]);
        
        if (!createStaffResult.success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to create staff record'
          });
        }
      }
      actualStaffId = staffId;
    }

    console.log(`🔧 Creating shift with staff ID: ${actualStaffId} (original: ${staffId})`);

    const result = await executeQuery(`
      INSERT INTO shifts (id, staff_id, start_time, starting_cash, status)
      VALUES (?, ?, ?, ?, 'active')
    `, [shiftId, actualStaffId, startTime, startingCash]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to start shift'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Shift started successfully',
      data: {
        id: shiftId,
        staffId: actualStaffId,
        start_time: startTime,
        starting_cash: parseFloat(startingCash)
      }
    });
  } catch (error) {
    console.error('Start shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// End a shift
router.put('/shifts/:id/end', [
  body('endingCash').isFloat({ min: 0 }).withMessage('Ending cash must be a positive number')
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

    const { id } = req.params;
    const { endingCash } = req.body;
    const endTime = new Date().toISOString();

    // First check if shift exists and is active
    const checkResult = await executeQuery(`
      SELECT * FROM shifts WHERE id = ? AND status = 'active'
    `, [id]);

    if (!checkResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to check shift status'
      });
    }

    if (checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found or already ended'
      });
    }

    const result = await executeQuery(`
      UPDATE shifts 
      SET end_time = ?, ending_cash = ?, status = 'completed'
      WHERE id = ? AND status = 'active'
    `, [endTime, endingCash, id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to end shift'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found or already ended'
      });
    }

    res.json({
      success: true,
      message: 'Shift ended successfully',
      data: {
        id: id,
        end_time: endTime,
        ending_cash: parseFloat(endingCash)
      }
    });
  } catch (error) {
    console.error('End shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get shifts
router.get('/shifts', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        s.*,
        st.name as staff_name,
        st.id as staff_id
      FROM shifts s
      LEFT JOIN staff st ON s.staff_id = st.id
      ORDER BY s.start_time DESC
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch shifts'
      });
    }

    // Format the data properly
    const formattedShifts = result.data.map(shift => ({
      ...shift,
      staff: {
        id: shift.staff_id,
        name: shift.staff_name || 'Unknown'
      },
      starting_cash: parseFloat(shift.starting_cash) || 0,
      ending_cash: shift.ending_cash ? parseFloat(shift.ending_cash) : null
    }));

    res.json({
      success: true,
      data: formattedShifts
    });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current active shift for a user (by userId or staffId)
router.get('/shifts/active', async (req, res) => {
  try {
    // Prefer userId from req.user, fallback to query param
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Find staff record for this user
    const staffResult = await executeQuery('SELECT id, name FROM staff WHERE user_id = ?', [userId]);
    if (!staffResult.success || staffResult.data.length === 0) {
      return res.json({ success: true, data: null });
    }
    const staffId = staffResult.data[0].id;
    const staffName = staffResult.data[0].name;

    // Find active shift for this staff
    const shiftResult = await executeQuery(
      'SELECT * FROM shifts WHERE staff_id = ? AND status = "active" ORDER BY start_time DESC LIMIT 1',
      [staffId]
    );
    if (!shiftResult.success || shiftResult.data.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const shift = shiftResult.data[0];
    const formattedShift = {
      ...shift,
      staff_id: staffId,
      cashierName: staffName,
      startingCash: parseFloat(shift.starting_cash) || 0
    };
    
    res.json({ success: true, data: formattedShift });
  } catch (error) {
    console.error('Get active shift error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== EXPENSES ROUTES =====

// Get expenses
router.get('/expenses', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT * FROM expenses 
      ORDER BY timestamp DESC
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add expense
router.post('/expenses', [
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
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

    const { description, amount, category, shiftId } = req.body;
    const expenseId = `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await executeQuery(`
      INSERT INTO expenses (id, description, amount, category, cashier, shift_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [expenseId, description, amount, category || null, req.user.username, shiftId || null]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add expense'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: { id: expenseId, description, amount }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(`
      DELETE FROM expenses WHERE id = ?
    `, [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete expense'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== CATEGORIES ROUTES =====

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id, name, 
             CASE WHEN image_data IS NOT NULL THEN CONCAT('/api/pos/category-images/', id) ELSE NULL END as image,
             created_at
      FROM categories 
      ORDER BY name
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add category
router.post('/categories', upload.single('image'), [
  body('name').notEmpty().withMessage('Category name is required')
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

    const { name } = req.body;

    // Handle image upload - store as BLOB
    let imageData = null;
    if (req.file) {
      try {
        imageData = fs.readFileSync(req.file.path);
        console.log('📁 Category image file size:', imageData.length, 'bytes');
        fs.unlinkSync(req.file.path); // Clean up temp file
        console.log('✅ Category image processed successfully');
      } catch (error) {
        console.error('❌ Error reading category image file:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing image file'
        });
      }
    }

    console.log('📊 Inserting category with image data size:', imageData ? imageData.length : 0, 'bytes');
    
    const result = await executeQuery(`
      INSERT INTO categories (name, image_data) VALUES (?, ?)
    `, [name, imageData]);

    if (!result.success) {
      console.error('Database error:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add category'
      });
    }

    const categoryId = result.data.insertId;

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: { 
        id: categoryId, 
        name, 
        image: imageData ? `/api/pos/category-images/${categoryId}` : null 
      }
    });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update category
router.put('/categories/:id', upload.single('image'), optimizeImage, [
  body('name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  try {
    console.log('📥 Update category request received:');
    console.log('  ID:', req.params.id);
    console.log('  Body:', req.body);
    console.log('  File:', req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    // Handle image upload - store as BLOB
    let imageData = null;
    console.log('🖼️ Category image upload handling:');
    console.log('  req.file:', req.file);
    if (req.file) {
      try {
        imageData = fs.readFileSync(req.file.path);
        console.log('📁 Category image file size:', imageData.length, 'bytes');
        fs.unlinkSync(req.file.path); // Clean up temp file
        console.log('  ✅ Category image uploaded as BLOB');
      } catch (error) {
        console.error('❌ Error reading category image file:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing image file'
        });
      }
    } else {
      console.log('  🔄 No new image uploaded, keeping existing');
    }

    let query, params;
    if (imageData) {
      query = `UPDATE categories SET name = ?, image_data = ? WHERE id = ?`;
      params = [name, imageData, id];
    } else {
      query = `UPDATE categories SET name = ? WHERE id = ?`;
      params = [name, id];
    }

    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const result = await executeQuery(query, params);

    if (!result.success) {
      console.error('Database error:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update category'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get the updated category to return in response
    const updatedCategoryResult = await executeQuery(`
      SELECT id, name, 
             CASE WHEN image_data IS NOT NULL THEN CONCAT('/api/pos/category-images/', id) ELSE NULL END as image,
             created_at
      FROM categories 
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategoryResult.success ? updatedCategoryResult.data[0] : null
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting category ID:', id);

    // First, check if category is being used by any inventory items
    const checkUsage = await executeQuery(`
      SELECT COUNT(*) as count FROM inventory WHERE category_id = ?
    `, [id]);

    if (!checkUsage.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to check category usage'
      });
    }

    const usageCount = checkUsage.data[0].count;
    console.log('📊 Category usage count:', usageCount);

    if (usageCount > 0) {
      // Update inventory items to remove category reference
      const updateInventory = await executeQuery(`
        UPDATE inventory SET category_id = NULL WHERE category_id = ?
      `, [id]);

      if (!updateInventory.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update inventory items'
        });
      }

      console.log('✅ Updated', updateInventory.data.affectedRows, 'inventory items');
    }

    // Now delete the category
    const result = await executeQuery('DELETE FROM categories WHERE id = ?', [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    console.log('✅ Category deleted successfully');

    res.json({
      success: true,
      message: `Category deleted successfully. ${usageCount > 0 ? `${usageCount} inventory items updated.` : ''}`
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== STAFF ROUTES =====

// Get staff
router.get('/staff', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT s.*, u.username, u.id as user_id 
      FROM staff s 
      LEFT JOIN users u ON s.user_id = u.id 
      ORDER BY s.name
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch staff'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add staff member
router.post('/staff', [
  body('name').notEmpty().withMessage('Name is required'),
  body('pin').isLength({ min: 4 }).withMessage('PIN must be at least 4 characters')
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

    const { name, role, pin } = req.body;
    const staffId = `staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Generate username from name (lowercase, no spaces, unique)
    let username = name.toLowerCase().replace(/\s+/g, '');
    let counter = 1;
    let finalUsername = username;

    // Check if username exists and make it unique
    while (true) {
      const existingUser = await executeQuery('SELECT id FROM users WHERE username = ?', [finalUsername]);
      if (existingUser.success && existingUser.data.length === 0) {
        break; // Username is unique
      }
      finalUsername = `${username}${counter}`;
      counter++;
    }

    // Hash the PIN to use as password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(pin, saltRounds);

    // Start transaction to create both staff and user
    const connection = await executeQuery('START TRANSACTION');

    try {
      // 1. Create staff record
      const staffResult = await executeQuery(`
        INSERT INTO staff (id, name, role, pin) VALUES (?, ?, ?, ?)
      `, [staffId, name, role || 'Cashier', pin]);

      if (!staffResult.success) {
        throw new Error('Failed to create staff record');
      }

      // 2. Create user account
      const userResult = await executeQuery(`
        INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)
      `, [finalUsername, passwordHash, role === 'Admin' ? 'admin' : 'cashier']);

      if (!userResult.success) {
        throw new Error('Failed to create user account');
      }

      // 3. Update staff record with user_id
      const updateStaffResult = await executeQuery(`
        UPDATE staff SET user_id = ? WHERE id = ?
      `, [userResult.data.insertId, staffId]);

      if (!updateStaffResult.success) {
        throw new Error('Failed to link staff to user');
      }

      // Commit transaction
      await executeQuery('COMMIT');

      console.log(`✅ Created staff member: ${name} (${role}) with username: ${finalUsername}`);

      res.status(201).json({
        success: true,
        message: 'Staff member added successfully',
        data: { 
          id: staffId, 
          name, 
          role: role || 'Cashier',
          username: finalUsername,
          userId: userResult.data.insertId
        }
      });

    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Update staff member
router.put('/staff/:id', [
  body('name').notEmpty().withMessage('Name is required')
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

    const { id } = req.params;
    const { name, role, pin } = req.body;

    // Get current staff record to find linked user
    const currentStaff = await executeQuery('SELECT user_id FROM staff WHERE id = ?', [id]);
    if (!currentStaff.success || currentStaff.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const userId = currentStaff.data[0].user_id;

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // 1. Update staff record
      let staffQuery = 'UPDATE staff SET name = ?, role = ?';
      let staffParams = [name, role || 'Cashier'];

      if (pin) {
        staffQuery += ', pin = ?';
        staffParams.push(pin);
      }

      staffQuery += ' WHERE id = ?';
      staffParams.push(id);

      const staffResult = await executeQuery(staffQuery, staffParams);

      if (!staffResult.success) {
        throw new Error('Failed to update staff record');
      }

      // 2. Update user record if user_id exists
      if (userId) {
        const userRole = role === 'Admin' ? 'admin' : 'cashier';
        const userResult = await executeQuery(`
          UPDATE users SET role = ? WHERE id = ?
        `, [userRole, userId]);

        if (!userResult.success) {
          throw new Error('Failed to update user record');
        }

        // 3. Update password if PIN was changed
        if (pin) {
          const saltRounds = 10;
          const passwordHash = await bcrypt.hash(pin, saltRounds);

          const passwordResult = await executeQuery(`
            UPDATE users SET password_hash = ? WHERE id = ?
          `, [passwordHash, userId]);

          if (!passwordResult.success) {
            throw new Error('Failed to update password');
          }
        }
      }

      // Commit transaction
      await executeQuery('COMMIT');

      console.log(`✅ Updated staff member: ${name} (${role})`);

      res.json({
        success: true,
        message: 'Staff member updated successfully'
      });

    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Delete staff member
router.delete('/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if staff member has active shifts
    const activeShifts = await executeQuery(
      'SELECT COUNT(*) as count FROM shifts WHERE staff_id = ? AND status = "active"',
      [id]
    );

    if (activeShifts.success && activeShifts.data[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete staff member with active shifts. Please end their shifts first.'
      });
    }

    // Check if staff member has any shifts (for data integrity)
    const allShifts = await executeQuery(
      'SELECT COUNT(*) as count FROM shifts WHERE staff_id = ?',
      [id]
    );

    if (allShifts.success && allShifts.data[0].count > 0) {
      console.log(`⚠️ Deleting staff member ${id} with ${allShifts.data[0].count} historical shifts`);
    }

    // Get staff record to find linked user
    const staffRecord = await executeQuery('SELECT user_id, name FROM staff WHERE id = ?', [id]);
    if (!staffRecord.success || staffRecord.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const userId = staffRecord.data[0].user_id;
    const staffName = staffRecord.data[0].name;

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // 1. Delete staff record
      const staffResult = await executeQuery('DELETE FROM staff WHERE id = ?', [id]);

      if (!staffResult.success) {
        throw new Error('Failed to delete staff record');
      }

      // 2. Delete user account if it exists
      if (userId) {
        const userResult = await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
        
        if (!userResult.success) {
          throw new Error('Failed to delete user account');
        }

        console.log(`✅ Deleted staff member: ${staffName} and their user account`);
      } else {
        console.log(`✅ Deleted staff member: ${staffName} (no linked user account)`);
      }

      // Commit transaction
      await executeQuery('COMMIT');

      res.json({
        success: true,
        message: 'Staff member deleted successfully'
      });

    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== RECEIPT SETTINGS ROUTES =====

// Get receipt settings
router.get('/receipt-settings', authenticateToken, async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM receipt_settings LIMIT 1');
    
    if (result.success && result.data.length > 0) {
      // Map database column names to JavaScript property names
      const mappedData = {
        logo: result.data[0].logo_data ? `data:image/png;base64,${result.data[0].logo_data.toString('base64')}` : null,
        companyName: result.data[0].company_name,
        address: result.data[0].address,
        phone: result.data[0].phone,
        footer: result.data[0].footer
      };
      
      res.json({
        success: true,
        data: mappedData
      });
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        logo: null,
        companyName: 'Moon Land',
        address: '123 Cosmic Way, Galaxy City',
        phone: '+123 456 7890',
        footer: 'Thank you for your business!'
      };
      
      res.json({
        success: true,
        data: defaultSettings
      });
    }
  } catch (error) {
    console.error('Get receipt settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update receipt settings
router.put('/receipt-settings', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    const { companyName, address, phone, footer, removeLogo } = req.body;
    
    // Validate required fields
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Handle logo upload - store as BLOB
    let logoData = null;
    if (req.file) {
      try {
        logoData = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path); // Clean up temp file
      } catch (error) {
        console.error('Error reading logo file:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing logo file'
        });
      }
    }

    // Check if settings exist
    const existingSettings = await executeQuery('SELECT COUNT(*) as count FROM receipt_settings');
    
    if (existingSettings.success && existingSettings.data[0].count > 0) {
      let query, params;
      
      if (removeLogo === 'true') {
        // Remove logo
        query = `
          UPDATE receipt_settings 
          SET logo_data = NULL, company_name = ?, address = ?, phone = ?, footer = ?, updated_at = NOW()
          WHERE id = (SELECT id FROM receipt_settings LIMIT 1)
        `;
        params = [companyName, address, phone, footer];
      } else if (logoData) {
        // Update with new logo
        query = `
          UPDATE receipt_settings 
          SET logo_data = ?, company_name = ?, address = ?, phone = ?, footer = ?, updated_at = NOW()
          WHERE id = (SELECT id FROM receipt_settings LIMIT 1)
        `;
        params = [logoData, companyName, address, phone, footer];
      } else {
        // Update without changing logo
        query = `
          UPDATE receipt_settings 
          SET company_name = ?, address = ?, phone = ?, footer = ?, updated_at = NOW()
          WHERE id = (SELECT id FROM receipt_settings LIMIT 1)
        `;
        params = [companyName, address, phone, footer];
      }
      
      const result = await executeQuery(query, params);
      
      if (!result.success) {
        throw new Error('Failed to update receipt settings');
      }
    } else {
      // Create new settings
      const result = await executeQuery(`
        INSERT INTO receipt_settings (logo_data, company_name, address, phone, footer, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [logoData, companyName, address, phone, footer]);
      
      if (!result.success) {
        throw new Error('Failed to create receipt settings');
      }
    }

    // Get updated settings
    const updatedSettings = await executeQuery('SELECT * FROM receipt_settings LIMIT 1');
    
    // Map database column names to JavaScript property names
    const mappedData = {
      logo: updatedSettings.data[0].logo_data ? `data:image/png;base64,${updatedSettings.data[0].logo_data.toString('base64')}` : null,
      companyName: updatedSettings.data[0].company_name,
      address: updatedSettings.data[0].address,
      phone: updatedSettings.data[0].phone,
      footer: updatedSettings.data[0].footer
    };
    
    res.json({
      success: true,
      data: mappedData,
      message: 'Receipt settings updated successfully'
    });
    
  } catch (error) {
    console.error('Update receipt settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;