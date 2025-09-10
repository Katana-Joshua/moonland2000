import express from 'express';
import { executeQuery } from '../config/database.js';
const router = express.Router();

// Get default receipt template
router.get('/default', async (req, res) => {
  try {
    const template = await executeQuery('SELECT * FROM receipt_templates WHERE is_default = true LIMIT 1');
    
    if (template.length === 0) {
      // Return default template if none exists
      return res.json({
        template_name: 'Default Template',
        header_text: 'Thank you for your business!',
        footer_text: 'Please come again!',
        show_logo: true,
        show_business_info: true,
        show_tax_info: true,
        show_cashier_info: true
      });
    }

    res.json(template[0]);
  } catch (error) {
    console.error('Error fetching default receipt template:', error);
    res.status(500).json({ error: 'Failed to fetch receipt template' });
  }
});

// Update receipt template
router.put('/update', async (req, res) => {
  try {
    const {
      template_name,
      header_text,
      footer_text,
      show_logo,
      show_business_info,
      show_tax_info,
      show_cashier_info
    } = req.body;

    // Update the default template
    await executeQuery(
      `UPDATE receipt_templates SET 
       template_name = ?, header_text = ?, footer_text = ?, 
       show_logo = ?, show_business_info = ?, show_tax_info = ?, show_cashier_info = ?
       WHERE is_default = true`,
      [template_name, header_text, footer_text, show_logo, show_business_info, show_tax_info, show_cashier_info]
    );

    const updatedTemplate = await executeQuery('SELECT * FROM receipt_templates WHERE is_default = true LIMIT 1');
    res.json(updatedTemplate[0]);
  } catch (error) {
    console.error('Error updating receipt template:', error);
    res.status(500).json({ error: 'Failed to update receipt template' });
  }
});

// Get all receipt templates
router.get('/', async (req, res) => {
  try {
    const templates = await executeQuery('SELECT * FROM receipt_templates ORDER BY is_default DESC, template_name ASC');
    res.json(templates);
  } catch (error) {
    console.error('Error fetching receipt templates:', error);
    res.status(500).json({ error: 'Failed to fetch receipt templates' });
  }
});

// Create new receipt template
router.post('/', async (req, res) => {
  try {
    const {
      template_name,
      header_text,
      footer_text,
      show_logo,
      show_business_info,
      show_tax_info,
      show_cashier_info,
      is_default
    } = req.body;

    if (!template_name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    // If this is set as default, unset all other defaults
    if (is_default) {
      await executeQuery('UPDATE receipt_templates SET is_default = false');
    }

    const result = await executeQuery(
      `INSERT INTO receipt_templates 
       (template_name, header_text, footer_text, show_logo, show_business_info, show_tax_info, show_cashier_info, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [template_name, header_text, footer_text, show_logo, show_business_info, show_tax_info, show_cashier_info, is_default || false]
    );

    const newTemplate = await executeQuery('SELECT * FROM receipt_templates WHERE id = ?', [result.insertId]);
    res.status(201).json(newTemplate[0]);
  } catch (error) {
    console.error('Error creating receipt template:', error);
    res.status(500).json({ error: 'Failed to create receipt template' });
  }
});

export default router;
