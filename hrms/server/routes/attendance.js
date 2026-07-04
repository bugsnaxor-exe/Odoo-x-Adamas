const express = require("express");
const db = require("../db/database");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");

const router = express.Router();
router.use(authMiddleware);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// POST /api/attendance/check-in
router.post("/check-in", (req, res) => {
  const date = todayStr();
  const now = new Date().toISOString();
  const existing = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?")
    .get(req.user.id, date);

  if (existing && existing.check_in) {
    return res.status(409).json({ error: "Already checked in today." });
  }

  if (existing) {
    db.prepare("UPDATE attendance SET check_in = ?, status = 'present' WHERE id = ?").run(now, existing.id);
  } else {
    db.prepare(
      `INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, 'present')`
    ).run(req.user.id, date, now);
  }

  const record = db.prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?").get(req.user.id, date);
  res.json({ attendance: record });
});

// POST /api/attendance/check-out
router.post("/check-out", (req, res) => {
  const date = todayStr();
  const now = new Date().toISOString();
  const existing = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?")
    .get(req.user.id, date);

  if (!existing || !existing.check_in) {
    return res.status(400).json({ error: "You must check in before checking out." });
  }
  if (existing.check_out) {
    return res.status(409).json({ error: "Already checked out today." });
  }

  db.prepare("UPDATE attendance SET check_out = ? WHERE id = ?").run(now, existing.id);
  const record = db.prepare("SELECT * FROM attendance WHERE id = ?").get(existing.id);
  res.json({ attendance: record });
});

// GET /api/attendance/my
router.get("/my", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC")
    .all(req.user.id);
  res.json({ attendance: rows });
});

// GET /api/attendance/all (admin only)
router.get("/all", requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, u.employee_id, p.first_name, p.last_name
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       ORDER BY a.date DESC, u.employee_id`
    )
    .all();
  res.json({ attendance: rows });
});

// GET /api/attendance/daily?date=YYYY-MM-DD
router.get("/daily", requireRole("admin"), (req, res) => {
  const date = req.query.date || todayStr();
  const rows = db
    .prepare(
      `SELECT a.*, u.employee_id, p.first_name, p.last_name
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE a.date = ?
       ORDER BY u.employee_id`
    )
    .all(date);
  res.json({ date, attendance: rows });
});

// GET /api/attendance/weekly?week=YYYY-MM-DD (start of week)
router.get("/weekly", requireRole("admin"), (req, res) => {
  const start = req.query.week ? new Date(req.query.week) : new Date();
  const startStr = start.toISOString().slice(0, 10);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endStr = end.toISOString().slice(0, 10);

  const rows = db
    .prepare(
      `SELECT a.*, u.employee_id, p.first_name, p.last_name
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE a.date BETWEEN ? AND ?
       ORDER BY a.date, u.employee_id`
    )
    .all(startStr, endStr);
  res.json({ start: startStr, end: endStr, attendance: rows });
});

module.exports = router;
