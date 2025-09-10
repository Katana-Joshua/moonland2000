import express from 'express';
import { executeQuery } from '../config/database.js';
const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await executeQuery('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      country,
      payment_terms,
      credit_limit
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const result = await executeQuery(
      `INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, payment_terms, credit_limit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, contact_person, email, phone, address, city, country, payment_terms, credit_limit || 0]
    );

    const newSupplier = await executeQuery('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json(newSupplier[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const suppliers = await executeQuery('SELECT * FROM suppliers WHERE id = ?', [id]);
    
    if (suppliers.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(suppliers[0]);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      country,
      payment_terms,
      credit_limit,
      is_active
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    await executeQuery(
      `UPDATE suppliers SET 
       name = ?, contact_person = ?, email = ?, phone = ?, address = ?, 
       city = ?, country = ?, payment_terms = ?, credit_limit = ?, is_active = ?
       WHERE id = ?`,
      [name, contact_person, email, phone, address, city, country, payment_terms, credit_limit, is_active, id]
    );

    const updatedSupplier = await executeQuery('SELECT * FROM suppliers WHERE id = ?', [id]);
    res.json(updatedSupplier[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier has any purchase orders
    const purchaseOrders = await executeQuery('SELECT COUNT(*) as count FROM purchase_orders WHERE supplier_id = ?', [id]);
    
    if (purchaseOrders[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete supplier with existing purchase orders' });
    }

    await executeQuery('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;
