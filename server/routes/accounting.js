import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery, executeTransaction } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// ===== ACCOUNTS ROUTES =====

// Get all accounts
router.get('/accounts', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT * FROM accounts 
      ORDER BY code
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch accounts'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add account
router.post('/accounts', [
  body('code').notEmpty().withMessage('Account code is required'),
  body('name').notEmpty().withMessage('Account name is required'),
  body('type').isIn(['asset', 'liability', 'equity', 'revenue', 'expense']).withMessage('Invalid account type')
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

    const { code, name, type, parentId, balance } = req.body;

    // Check if code already exists
    const existingAccount = await executeQuery(
      'SELECT id FROM accounts WHERE code = ?',
      [code]
    );

    if (existingAccount.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Account code already exists'
      });
    }

    const result = await executeQuery(`
      INSERT INTO accounts (code, name, type, parent_id, balance) 
      VALUES (?, ?, ?, ?, ?)
    `, [code, name, type, parentId || null, balance || 0]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add account'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account added successfully',
      data: { id: result.data.insertId, code, name, type }
    });
  } catch (error) {
    console.error('Add account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== VOUCHERS ROUTES =====

// Get all vouchers
router.get('/vouchers', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT v.*, COUNT(ve.id) as entry_count
      FROM vouchers v
      LEFT JOIN voucher_entries ve ON v.id = ve.voucher_id
    `;
    
    const conditions = [];
    const params = [];

    if (startDate) {
      conditions.push('DATE(v.date) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('DATE(v.date) <= ?');
      params.push(endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY v.id ORDER BY v.date DESC, v.created_at DESC';

    const result = await executeQuery(query, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vouchers'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get voucher details with entries
router.get('/vouchers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const voucherResult = await executeQuery(`
      SELECT * FROM vouchers WHERE id = ?
    `, [id]);

    if (!voucherResult.success || voucherResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    const entriesResult = await executeQuery(`
      SELECT ve.*, a.code as account_code, a.name as account_name
      FROM voucher_entries ve
      LEFT JOIN accounts a ON ve.account_id = a.id
      WHERE ve.voucher_id = ?
      ORDER BY ve.id
    `, [id]);

    if (!entriesResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch voucher entries'
      });
    }

    res.json({
      success: true,
      data: {
        voucher: voucherResult.data[0],
        entries: entriesResult.data
      }
    });
  } catch (error) {
    console.error('Get voucher details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add voucher with entries
router.post('/vouchers', [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('entries').isArray({ min: 2 }).withMessage('At least 2 entries are required')
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

    const { date, description, entries } = req.body;

    // Validate entries (debits must equal credits)
    const totalDebits = entries.reduce((sum, entry) => sum + (parseFloat(entry.debitAmount) || 0), 0);
    const totalCredits = entries.reduce((sum, entry) => sum + (parseFloat(entry.creditAmount) || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total debits must equal total credits'
      });
    }

    const voucherId = `voucher-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const voucherNumber = `VCH-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;

    const queries = [
      {
        query: `
          INSERT INTO vouchers (id, voucher_number, date, description, total_amount, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        params: [voucherId, voucherNumber, date, description, totalDebits, req.user.username]
      }
    ];

    // Add voucher entries
    for (const entry of entries) {
      queries.push({
        query: `
          INSERT INTO voucher_entries (voucher_id, account_id, debit_amount, credit_amount, description)
          VALUES (?, ?, ?, ?, ?)
        `,
        params: [
          voucherId, 
          entry.accountId, 
          parseFloat(entry.debitAmount) || 0, 
          parseFloat(entry.creditAmount) || 0, 
          entry.description || null
        ]
      });

      // Update account balances
      if (parseFloat(entry.debitAmount) > 0) {
        queries.push({
          query: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          params: [parseFloat(entry.debitAmount), entry.accountId]
        });
      }
      if (parseFloat(entry.creditAmount) > 0) {
        queries.push({
          query: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
          params: [parseFloat(entry.creditAmount), entry.accountId]
        });
      }
    }

    const result = await executeTransaction(queries);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create voucher'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: {
        id: voucherId,
        voucherNumber,
        date,
        totalAmount: totalDebits
      }
    });
  } catch (error) {
    console.error('Add voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== REPORTS ROUTES =====

// Trial Balance
router.get('/reports/trial-balance', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        code,
        name,
        type,
        balance,
        CASE 
          WHEN type IN ('asset', 'expense') THEN balance
          ELSE 0 
        END as debit_balance,
        CASE 
          WHEN type IN ('liability', 'equity', 'revenue') THEN balance
          ELSE 0 
        END as credit_balance
      FROM accounts 
      WHERE balance != 0
      ORDER BY code
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate trial balance'
      });
    }

    const totalDebits = result.data.reduce((sum, account) => sum + parseFloat(account.debit_balance), 0);
    const totalCredits = result.data.reduce((sum, account) => sum + parseFloat(account.credit_balance), 0);

    res.json({
      success: true,
      data: {
        accounts: result.data,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
      }
    });
  } catch (error) {
    console.error('Trial balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Profit and Loss
router.get('/reports/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateCondition = '';
    const params = [];
    
    if (startDate && endDate) {
      dateCondition = 'WHERE DATE(v.date) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const result = await executeQuery(`
      SELECT 
        a.code,
        a.name,
        a.type,
        SUM(CASE WHEN ve.debit_amount > 0 THEN ve.debit_amount ELSE 0 END) as total_debits,
        SUM(CASE WHEN ve.credit_amount > 0 THEN ve.credit_amount ELSE 0 END) as total_credits
      FROM accounts a
      LEFT JOIN voucher_entries ve ON a.id = ve.account_id
      LEFT JOIN vouchers v ON ve.voucher_id = v.id
      ${dateCondition}
      WHERE a.type IN ('revenue', 'expense')
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.type, a.code
    `, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate profit and loss'
      });
    }

    const revenues = result.data.filter(account => account.type === 'revenue');
    const expenses = result.data.filter(account => account.type === 'expense');

    const totalRevenue = revenues.reduce((sum, account) => sum + parseFloat(account.total_credits || 0), 0);
    const totalExpenses = expenses.reduce((sum, account) => sum + parseFloat(account.total_debits || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      success: true,
      data: {
        revenues,
        expenses,
        totalRevenue,
        totalExpenses,
        netProfit,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Profit and loss error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Balance Sheet
router.get('/reports/balance-sheet', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        code,
        name,
        type,
        balance
      FROM accounts 
      WHERE type IN ('asset', 'liability', 'equity') AND balance != 0
      ORDER BY type, code
    `);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate balance sheet'
      });
    }

    const assets = result.data.filter(account => account.type === 'asset');
    const liabilities = result.data.filter(account => account.type === 'liability');
    const equity = result.data.filter(account => account.type === 'equity');

    const totalAssets = assets.reduce((sum, account) => sum + parseFloat(account.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, account) => sum + parseFloat(account.balance), 0);
    const totalEquity = equity.reduce((sum, account) => sum + parseFloat(account.balance), 0);

    res.json({
      success: true,
      data: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced: Math.abs((totalAssets) - (totalLiabilities + totalEquity)) < 0.01
      }
    });
  } catch (error) {
    console.error('Balance sheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Day Book
router.get('/reports/day-book', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const result = await executeQuery(`
      SELECT 
        v.voucher_number,
        v.date,
        v.description,
        v.total_amount,
        v.created_by,
        ve.account_id,
        a.code as account_code,
        a.name as account_name,
        ve.debit_amount,
        ve.credit_amount,
        ve.description as entry_description
      FROM vouchers v
      LEFT JOIN voucher_entries ve ON v.id = ve.voucher_id
      LEFT JOIN accounts a ON ve.account_id = a.id
      WHERE DATE(v.date) = ?
      ORDER BY v.created_at, ve.id
    `, [date]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate day book'
      });
    }

    res.json({
      success: true,
      data: {
        date,
        entries: result.data
      }
    });
  } catch (error) {
    console.error('Day book error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 