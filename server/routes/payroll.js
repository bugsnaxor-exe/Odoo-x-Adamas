// ============================================
// Payroll Routes — View & Manage Payroll Records
// ============================================
const express = require('express');
const router = express.Router();
const db = require('../db/database.js');
const auth = require('../middleware/auth.js');
const roleGuard = require('../middleware/roleGuard.js');

// All payroll routes require authentication
router.use(auth);

// -----------------------------------------
// GET /my — Get own payroll records
// Query param: month (YYYY-MM) — if omitted, returns all months
// -----------------------------------------
router.get('/my', (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let sql = 'SELECT * FROM payroll WHERE user_id = ?';
    const params = [userId];

    if (month) {
      sql += ' AND month = ?';
      params.push(month);
    }

    sql += ' ORDER BY month DESC';

    const records = db.prepare(sql).all(...params);
    res.json(records);
  } catch (err) {
    console.error('Error fetching own payroll:', err.message);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// -----------------------------------------
// GET /all — All payroll records (admin only)
// Query param: month (YYYY-MM)
// -----------------------------------------
router.get('/all', roleGuard('admin'), (req, res) => {
  try {
    const { month } = req.query;

    let sql = `
      SELECT
        pay.*,
        u.email,
        p.first_name, p.last_name
      FROM payroll pay
      JOIN users u ON pay.user_id = u.id
      LEFT JOIN profiles p ON pay.user_id = p.user_id
    `;
    const params = [];

    if (month) {
      sql += ' WHERE pay.month = ?';
      params.push(month);
    }

    sql += ' ORDER BY pay.month DESC, pay.user_id';

    const records = db.prepare(sql).all(...params);
    res.json(records);
  } catch (err) {
    console.error('Error fetching all payroll:', err.message);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// -----------------------------------------
// PUT /:userId — Create or update payroll for a user+month (admin only)
// Required: month, basic_salary
// Optional: allowances, deductions
// Calculates net_salary automatically
// -----------------------------------------
router.put('/:userId', roleGuard('admin'), (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { month, basic_salary, allowances, deductions } = req.body;

    // --- Validation ---
    if (!month || basic_salary === undefined || basic_salary === null) {
      return res.status(400).json({ error: 'month and basic_salary are required' });
    }

    // Verify the target user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Default allowances and deductions to 0 if not provided
    const finalAllowances = parseFloat(allowances) || 0;
    const finalDeductions = parseFloat(deductions) || 0;
    const basicSalary = parseFloat(basic_salary);

    // Calculate net salary
    const netSalary = basicSalary + finalAllowances - finalDeductions;

    // UPSERT — insert new payroll or update existing for user+month
    db.prepare(`
      INSERT INTO payroll (user_id, month, basic_salary, allowances, deductions, net_salary, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, month) DO UPDATE SET
        basic_salary = excluded.basic_salary,
        allowances   = excluded.allowances,
        deductions   = excluded.deductions,
        net_salary   = excluded.net_salary,
        updated_by   = excluded.updated_by
    `).run(userId, month, basicSalary, finalAllowances, finalDeductions, netSalary, req.user.id);

    // Return the upserted record
    const record = db.prepare(`
      SELECT * FROM payroll WHERE user_id = ? AND month = ?
    `).get(userId, month);

    res.json(record);
  } catch (err) {
    console.error('Error updating payroll:', err.message);
    res.status(500).json({ error: 'Failed to update payroll' });
  }
});

module.exports = router;
