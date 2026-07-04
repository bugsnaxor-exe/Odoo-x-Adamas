// ============================================
// Attendance Routes — Check-in/out & Records
// ============================================
const express = require('express');
const router = express.Router();
const db = require('../db/database.js');
const auth = require('../middleware/auth.js');
const roleGuard = require('../middleware/roleGuard.js');

// All attendance routes require authentication
router.use(auth);

// -----------------------------------------
// Helper: get today's date in ISO format
// -----------------------------------------
function getToday() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// -----------------------------------------
// Helper: get Monday of the week containing a given date
// -----------------------------------------
function getMonday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

// -----------------------------------------
// Helper: get Sunday of the week containing a given date
// -----------------------------------------
function getSunday(dateStr) {
  const monday = new Date(getMonday(dateStr));
  monday.setDate(monday.getDate() + 6);
  return monday.toISOString().split('T')[0];
}

// -----------------------------------------
// POST /check-in — Record today's check-in
// -----------------------------------------
router.post('/check-in', (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();
    const now = new Date().toISOString();

    // Check if already checked in today
    const existing = db.prepare(`
      SELECT * FROM attendance WHERE user_id = ? AND date = ?
    `).get(userId, today);

    if (existing && existing.check_in) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // UPSERT — insert new record or update if date row exists (preserves check_out)
    db.prepare(`
      INSERT INTO attendance (user_id, date, check_in, status)
      VALUES (?, ?, ?, 'present')
      ON CONFLICT(user_id, date) DO UPDATE SET
        check_in = excluded.check_in,
        status = 'present'
    `).run(userId, today, now);

    const record = db.prepare(`
      SELECT * FROM attendance WHERE user_id = ? AND date = ?
    `).get(userId, today);

    res.status(201).json(record);
  } catch (err) {
    console.error('Error during check-in:', err.message);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// -----------------------------------------
// POST /check-out — Record today's check-out
// -----------------------------------------
router.post('/check-out', (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();
    const now = new Date().toISOString();

    // Must have checked in first
    const existing = db.prepare(`
      SELECT * FROM attendance WHERE user_id = ? AND date = ?
    `).get(userId, today);

    if (!existing || !existing.check_in) {
      return res.status(400).json({ error: 'No check-in found for today' });
    }

    // Calculate hours worked to determine if half-day
    const checkInTime = new Date(existing.check_in);
    const checkOutTime = new Date(now);
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    const status = hoursWorked < 4 ? 'half-day' : 'present';

    db.prepare(`
      UPDATE attendance
      SET check_out = ?, status = ?
      WHERE user_id = ? AND date = ?
    `).run(now, status, userId, today);

    const record = db.prepare(`
      SELECT * FROM attendance WHERE user_id = ? AND date = ?
    `).get(userId, today);

    res.json(record);
  } catch (err) {
    console.error('Error during check-out:', err.message);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// -----------------------------------------
// GET /my — Get own attendance records
// Query params: month (YYYY-MM), startDate, endDate
// Default: current month
// -----------------------------------------
router.get('/my', (req, res) => {
  try {
    const userId = req.user.id;
    const { month, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM attendance WHERE user_id = ?';
    const params = [userId];

    if (startDate && endDate) {
      // Custom date range
      sql += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else {
      // Filter by month (default: current month)
      const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM
      sql += ' AND date LIKE ?';
      params.push(`${targetMonth}%`);
    }

    sql += ' ORDER BY date DESC';

    const records = db.prepare(sql).all(...params);
    res.json(records);
  } catch (err) {
    console.error('Error fetching own attendance:', err.message);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// -----------------------------------------
// GET /daily — Get attendance for a specific date
// Employees: own record; Admins: all employees
// Query param: date (default: today)
// -----------------------------------------
router.get('/daily', (req, res) => {
  try {
    const date = req.query.date || getToday();
    const isAdmin = req.user.role === 'admin';

    if (isAdmin) {
      // Admin sees all employees' attendance for that date
      const records = db.prepare(`
        SELECT
          a.*,
          u.email,
          p.first_name, p.last_name
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN profiles p ON a.user_id = p.user_id
        WHERE a.date = ?
        ORDER BY a.user_id
      `).all(date);

      return res.json(records);
    }

    // Employee: own record only
    const record = db.prepare(`
      SELECT * FROM attendance WHERE user_id = ? AND date = ?
    `).get(req.user.id, date);

    res.json(record || null);
  } catch (err) {
    console.error('Error fetching daily attendance:', err.message);
    res.status(500).json({ error: 'Failed to fetch daily attendance' });
  }
});

// -----------------------------------------
// GET /weekly — Get attendance for a week
// Query param: date (any date in the desired week, default: today)
// Employees: own records; Admins: all employees
// -----------------------------------------
router.get('/weekly', (req, res) => {
  try {
    const targetDate = req.query.date || getToday();
    const monday = getMonday(targetDate);
    const sunday = getSunday(targetDate);
    const isAdmin = req.user.role === 'admin';

    if (isAdmin) {
      const records = db.prepare(`
        SELECT
          a.*,
          u.email,
          p.first_name, p.last_name
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN profiles p ON a.user_id = p.user_id
        WHERE a.date BETWEEN ? AND ?
        ORDER BY a.user_id, a.date
      `).all(monday, sunday);

      return res.json(records);
    }

    // Employee: own records only
    const records = db.prepare(`
      SELECT * FROM attendance
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date
    `).all(req.user.id, monday, sunday);

    res.json(records);
  } catch (err) {
    console.error('Error fetching weekly attendance:', err.message);
    res.status(500).json({ error: 'Failed to fetch weekly attendance' });
  }
});

// -----------------------------------------
// GET /all — All attendance records (admin only)
// Query param: month (YYYY-MM)
// -----------------------------------------
router.get('/all', roleGuard('admin'), (req, res) => {
  try {
    const { month } = req.query;

    let sql = `
      SELECT
        a.*,
        u.email,
        p.first_name, p.last_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN profiles p ON a.user_id = p.user_id
    `;
    const params = [];

    if (month) {
      sql += ' WHERE a.date LIKE ?';
      params.push(`${month}%`);
    }

    sql += ' ORDER BY a.user_id, a.date DESC';

    const records = db.prepare(sql).all(...params);
    res.json(records);
  } catch (err) {
    console.error('Error fetching all attendance:', err.message);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

module.exports = router;
