import express from 'express';
import { executeQuery, executeTransaction } from '../config/database.js';
const router = express.Router();

// Get all purchase orders with supplier names
router.get('/', async (req, res) => {
  try {
    const purchaseOrders = await executeQuery(`
      SELECT 
        po.*,
        s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.created_at DESC
    `);
    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Create new purchase order
router.post('/', async (req, res) => {
  try {
    const {
      supplier_id,
      order_date,
      expected_delivery_date,
      notes,
      items
    } = req.body;

    if (!supplier_id || !order_date || !items || items.length === 0) {
      return res.status(400).json({ error: 'Supplier, order date, and items are required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const poNumber = `PO-${Date.now()}`;

    const result = await executeTransaction(async (connection) => {
      // Insert purchase order
      const [poResult] = await connection.execute(
        `INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_delivery_date, total_amount, notes, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [poNumber, supplier_id, order_date, expected_delivery_date, totalAmount, notes, 1] // TODO: Get actual user ID
      );

      const poId = poResult.insertId;

      // Insert purchase order items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO purchase_order_items (po_id, item_name, description, quantity, unit_price, total_price) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [poId, item.name, item.description, item.quantity, item.unit_price, item.total_price]
        );
      }

      return poId;
    });

    // Fetch the created purchase order with supplier name
    const createdPO = await executeQuery(`
      SELECT 
        po.*,
        s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `, [result]);

    res.status(201).json(createdPO[0]);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// Get purchase order by ID with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const purchaseOrder = await executeQuery(`
      SELECT 
        po.*,
        s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `, [id]);

    if (purchaseOrder.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const items = await executeQuery(
      'SELECT * FROM purchase_order_items WHERE po_id = ?',
      [id]
    );

    res.json({
      ...purchaseOrder[0],
      items
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// Update purchase order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'ordered', 'received', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await executeQuery(
      'UPDATE purchase_orders SET status = ? WHERE id = ?',
      [status, id]
    );

    const updatedPO = await executeQuery(`
      SELECT 
        po.*,
        s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `, [id]);

    res.json(updatedPO[0]);
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    res.status(500).json({ error: 'Failed to update purchase order status' });
  }
});

// Delete purchase order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await executeTransaction(async (connection) => {
      // Delete purchase order items first
      await connection.execute('DELETE FROM purchase_order_items WHERE po_id = ?', [id]);
      
      // Delete purchase order
      await connection.execute('DELETE FROM purchase_orders WHERE id = ?', [id]);
    });

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
});

export default router;
