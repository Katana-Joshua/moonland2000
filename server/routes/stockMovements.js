import express from 'express';
import { executeQuery } from '../config/database.js';
const router = express.Router();

// Get stock movements with filters
router.get('/', async (req, res) => {
  try {
    const { item_id, start_date, end_date, movement_type } = req.query;
    
    let query = `
      SELECT 
        sm.*,
        i.name as item_name
      FROM stock_movements sm
      LEFT JOIN inventory i ON sm.item_id = i.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (item_id) {
      query += ' AND sm.item_id = ?';
      params.push(item_id);
    }
    
    if (start_date) {
      query += ' AND DATE(sm.created_at) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(sm.created_at) <= ?';
      params.push(end_date);
    }
    
    if (movement_type) {
      query += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }
    
    query += ' ORDER BY sm.created_at DESC';
    
    const movements = await executeQuery(query, params);
    res.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Create stock movement
router.post('/', async (req, res) => {
  try {
    const {
      item_id,
      movement_type,
      quantity_change,
      previous_stock,
      new_stock,
      reference_type,
      reference_id,
      notes,
      created_by
    } = req.body;

    if (!item_id || !movement_type || quantity_change === undefined || !previous_stock || !new_stock) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const result = await executeQuery(
      `INSERT INTO stock_movements 
       (item_id, movement_type, quantity_change, previous_stock, new_stock, reference_type, reference_id, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_id, movement_type, quantity_change, previous_stock, new_stock, reference_type, reference_id, notes, created_by || 1]
    );

    const newMovement = await executeQuery(`
      SELECT 
        sm.*,
        i.name as item_name
      FROM stock_movements sm
      LEFT JOIN inventory i ON sm.item_id = i.id
      WHERE sm.id = ?
    `, [result.insertId]);

    res.status(201).json(newMovement[0]);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ error: 'Failed to create stock movement' });
  }
});

// Get stock movements for specific item
router.get('/item/:item_id', async (req, res) => {
  try {
    const { item_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        sm.*,
        i.name as item_name
      FROM stock_movements sm
      LEFT JOIN inventory i ON sm.item_id = i.id
      WHERE sm.item_id = ?
    `;
    
    const params = [item_id];
    
    if (start_date) {
      query += ' AND DATE(sm.created_at) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(sm.created_at) <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY sm.created_at DESC';
    
    const movements = await executeQuery(query, params);
    res.json(movements);
  } catch (error) {
    console.error('Error fetching item stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch item stock movements' });
  }
});

export default router;
