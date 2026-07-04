// ============================================
// Leave Routes — Apply, View & Review Leave Requests
// ============================================
const express = require('express');
const router = express.Router();
const db = require('../db/database.js');
const auth = require('../middleware/auth.js');
const roleGuard = require('../middleware/roleGuard.js');

// All leave routes require authentication
router.use(auth);

// -----------------------------------------
// Helper: get all dates between start and end (inclusive)
// Returns array of YYYY-MM-DD strings
// -----------------------------------------
function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// -----------------------------------------
// POST /apply — Employee applies for leave
// -----------------------------------------
router.post('/apply', (req, res) => {
  try {
    const userId = req.user.id;
    const { leave_type, start_date, end_date, reason } = req.body;

    // --- Validation ---
    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'leave_type, start_date, and end_date are required' });
    }

    const validTypes = ['paid', 'sick', 'unpaid'];
    if (!validTypes.includes(leave_type)) {
      return res.status(400).json({ error: `leave_type must be one of: ${validTypes.join(', ')}` });
    }

    if (start_date > end_date) {
      return res.status(400).json({ error: 'start_date must be on or before end_date' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (start_date < today) {
      return res.status(400).json({ error: 'start_date must be today or in the future' });
    }

    // --- Create leave request ---
    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).run(userId, leave_type, start_date, end_date, reason || '', now);

    const leaveRequest = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(leaveRequest);
  } catch (err) {
    console.error('Error applying for leave:', err.message);
    res.status(500).json({ error: 'Failed to apply for leave' });
  }
});

// -----------------------------------------
// GET /my — Get own leave requests
// Query param: status (pending/approved/rejected)
// -----------------------------------------
router.get('/my', (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let sql = 'SELECT * FROM leave_requests WHERE user_id = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const records = db.prepare(sql).all(...params);
    res.json(records);
  } catch (err) {
    console.error('Error fetching own leaves:', err.message);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// -----------------------------------------
// GET /all — All leave requests (admin only)
// Query param: status
// -----------------------------------------
router.get('/all', roleGuard('admin'), (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT
        l.*,
        u.email,
        p.first_name, p.last_name
      FROM leave_requests l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN profiles p ON l.user_id = p.user_id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE l.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY l.created_at DESC';

    const records = db.prepare(sql).all(...params);
    res.json(records);
  } catch (err) {
    console.error('Error fetching all leaves:', err.message);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// -----------------------------------------
// PUT /:id/review — Admin reviews a leave request
// Approves or rejects; if approved, marks attendance as 'leave'
// -----------------------------------------
router.put('/:id/review', roleGuard('admin'), (req, res) => {
  try {
    const leaveId = parseInt(req.params.id);
    const { status, admin_comment } = req.body;

    // --- Validation ---
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    // Fetch the leave request
    const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Update leave request with review
    db.prepare(`
      UPDATE leave_requests
      SET status = ?, admin_comment = ?, reviewed_by = ?
      WHERE id = ?
    `).run(status, admin_comment || '', req.user.id, leaveId);

    // If approved, create attendance records with 'leave' status for each date
    if (status === 'approved') {
      const dates = getDateRange(leave.start_date, leave.end_date);
      const upsertStmt = db.prepare(`
        INSERT INTO attendance (user_id, date, status)
        VALUES (?, ?, 'leave')
        ON CONFLICT(user_id, date) DO UPDATE SET status = 'leave'
      `);

      // Use a transaction for batch attendance updates
      const insertLeaveAttendance = db.transaction((userId, leaveDates) => {
        for (const date of leaveDates) {
          upsertStmt.run(userId, date);
        }
      });

      insertLeaveAttendance(leave.user_id, dates);
    }

    // Return updated leave request
    const updatedLeave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);
    res.json(updatedLeave);
  } catch (err) {
    console.error('Error reviewing leave:', err.message);
    res.status(500).json({ error: 'Failed to review leave request' });
  }
});

module.exports = router;
