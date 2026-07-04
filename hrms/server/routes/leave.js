const express = require("express");
const db = require("../db/database");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");

const router = express.Router();
router.use(authMiddleware);

// POST /api/leave/apply
router.post("/apply", (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: "leave_type, start_date and end_date are required." });
  }
  if (!["paid", "sick", "unpaid"].includes(leave_type)) {
    return res.status(400).json({ error: "Invalid leave_type." });
  }
  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ error: "end_date cannot be before start_date." });
  }

  const info = db
    .prepare(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    )
    .run(req.user.id, leave_type, start_date, end_date, reason || null);

  const record = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ leave: record });
});

// GET /api/leave/my
router.get("/my", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json({ leave: rows });
});

// GET /api/leave/all (admin only) - all requests, optionally filter by status
router.get("/all", requireRole("admin"), (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db
        .prepare(
          `SELECT l.*, u.employee_id, p.first_name, p.last_name
           FROM leave_requests l
           JOIN users u ON u.id = l.user_id
           LEFT JOIN profiles p ON p.user_id = u.id
           WHERE l.status = ?
           ORDER BY l.created_at DESC`
        )
        .all(status)
    : db
        .prepare(
          `SELECT l.*, u.employee_id, p.first_name, p.last_name
           FROM leave_requests l
           JOIN users u ON u.id = l.user_id
           LEFT JOIN profiles p ON p.user_id = u.id
           ORDER BY l.created_at DESC`
        )
        .all();
  res.json({ leave: rows });
});

// PUT /api/leave/:id/review (admin only) - approve/reject with comment
router.put("/:id/review", requireRole("admin"), (req, res) => {
  const { status, admin_comment } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be 'approved' or 'rejected'." });
  }

  const leaveReq = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(req.params.id);
  if (!leaveReq) return res.status(404).json({ error: "Leave request not found." });

  const applyReview = db.transaction(() => {
    db.prepare(
      `UPDATE leave_requests SET status = ?, admin_comment = ?, reviewed_by = ? WHERE id = ?`
    ).run(status, admin_comment || null, req.user.id, req.params.id);

    // If approved, mark attendance as 'leave' for each day in range.
    if (status === "approved") {
      const start = new Date(leaveReq.start_date);
      const end = new Date(leaveReq.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        const existing = db
          .prepare("SELECT id FROM attendance WHERE user_id = ? AND date = ?")
          .get(leaveReq.user_id, dateStr);
        if (existing) {
          db.prepare("UPDATE attendance SET status = 'leave' WHERE id = ?").run(existing.id);
        } else {
          db.prepare(
            "INSERT INTO attendance (user_id, date, status) VALUES (?, ?, 'leave')"
          ).run(leaveReq.user_id, dateStr);
        }
      }
    }
  });

  applyReview();
  const updated = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(req.params.id);
  res.json({ leave: updated });
});

module.exports = router;
