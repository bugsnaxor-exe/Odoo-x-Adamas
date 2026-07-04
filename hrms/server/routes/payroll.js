const express = require("express");
const db = require("../db/database");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");

const router = express.Router();
router.use(authMiddleware);

// GET /api/payroll/my
router.get("/my", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM payroll WHERE user_id = ? ORDER BY month DESC")
    .all(req.user.id);
  res.json({ payroll: rows });
});

// GET /api/payroll/all (admin only)
router.get("/all", requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT pr.*, u.employee_id, p.first_name, p.last_name
       FROM payroll pr
       JOIN users u ON u.id = pr.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       ORDER BY pr.month DESC, u.employee_id`
    )
    .all();
  res.json({ payroll: rows });
});

// PUT /api/payroll/:userId (admin only) - update/create salary structure for a month
router.put("/:userId", requireRole("admin"), (req, res) => {
  const { month, basic_salary, allowances, deductions } = req.body;
  if (!month || basic_salary === undefined) {
    return res.status(400).json({ error: "month and basic_salary are required." });
  }

  const basic = Number(basic_salary) || 0;
  const allow = Number(allowances) || 0;
  const deduct = Number(deductions) || 0;
  const net = basic + allow - deduct;

  const existing = db
    .prepare("SELECT id FROM payroll WHERE user_id = ? AND month = ?")
    .get(req.params.userId, month);

  if (existing) {
    db.prepare(
      `UPDATE payroll SET basic_salary = ?, allowances = ?, deductions = ?, net_salary = ?,
       updated_by = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(basic, allow, deduct, net, req.user.id, existing.id);
  } else {
    db.prepare(
      `INSERT INTO payroll (user_id, month, basic_salary, allowances, deductions, net_salary, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.params.userId, month, basic, allow, deduct, net, req.user.id);
  }

  const record = db
    .prepare("SELECT * FROM payroll WHERE user_id = ? AND month = ?")
    .get(req.params.userId, month);
  res.json({ payroll: record });
});

module.exports = router;
