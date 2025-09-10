import express from 'express';
import { executeQuery } from '../config/database.js';
const router = express.Router();

// Get current currency settings
router.get('/current', async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  
  try {
    const result = await executeQuery('SELECT * FROM currency_settings WHERE is_active = true LIMIT 1');
    
    if (!result.success || result.data.length === 0) {
      // Return default currency if none is set
      return res.json({
        currency_code: 'UGX',
        currency_symbol: 'UGX',
        currency_name: 'Ugandan Shilling'
      });
    }

    res.json(result.data[0]);
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    res.status(500).json({ error: 'Failed to fetch currency settings' });
  }
});

// Update currency settings
router.put('/update', async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  
  try {
    const { currency_code, currency_symbol, currency_name } = req.body;

    if (!currency_code || !currency_symbol || !currency_name) {
      return res.status(400).json({ error: 'Currency code, symbol, and name are required' });
    }

    // First, deactivate all currencies
    await executeQuery('UPDATE currency_settings SET is_active = false');

    // Check if currency already exists
    const existing = await executeQuery(
      'SELECT id FROM currency_settings WHERE currency_code = ?',
      [currency_code]
    );

    if (existing.success && existing.data.length > 0) {
      // Update existing currency
      await executeQuery(
        'UPDATE currency_settings SET currency_symbol = ?, currency_name = ?, is_active = true WHERE currency_code = ?',
        [currency_symbol, currency_name, currency_code]
      );
    } else {
      // Insert new currency
      await executeQuery(
        'INSERT INTO currency_settings (currency_code, currency_symbol, currency_name, is_active) VALUES (?, ?, ?, true)',
        [currency_code, currency_symbol, currency_name]
      );
    }

    res.json({
      currency_code,
      currency_symbol,
      currency_name,
      is_active: true
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    res.status(500).json({ error: 'Failed to update currency settings' });
  }
});

// OPTIONS handlers for CORS
router.options('/current', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.status(200).end();
});

router.options('/update', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.status(200).end();
});

export default router;
