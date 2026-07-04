const express = require("express");
const db = require("../db/database");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");

const router = express.Router();
router.use(authMiddleware);

// Fields an employee is allowed to edit on their own profile.
const EMPLOYEE_EDITABLE_FIELDS = ["first_name", "last_name", "phone", "address", "profile_picture"];
// Additional fields only an admin may edit.
const ADMIN_ONLY_FIELDS = ["department", "job_title", "date_of_joining"];

function getProfileRow(userId) {
  return db
    .prepare(
      `SELECT p.*, u.employee_id, u.email, u.role
       FROM profiles p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?`
    )
    .get(userId);
}

// GET /api/profile/all  (admin only) - must be declared before /:id
router.get("/all", requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.*, u.employee_id, u.email, u.role
       FROM profiles p JOIN users u ON u.id = p.user_id
       ORDER BY u.employee_id`
    )
    .all();
  res.json({ profiles: rows });
});

// GET /api/profile/:id
router.get("/:id", (req, res) => {
  const targetId = Number(req.params.id);
  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "You can only view your own profile." });
  }
  const profile = getProfileRow(targetId);
  if (!profile) return res.status(404).json({ error: "Profile not found." });
  res.json({ profile });
});

// PUT /api/profile/:id
router.put("/:id", (req, res) => {
  const targetId = Number(req.params.id);
  const isSelf = req.user.id === targetId;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: "You can only edit your own profile." });
  }

  const allowedFields = isAdmin
    ? [...EMPLOYEE_EDITABLE_FIELDS, ...ADMIN_ONLY_FIELDS]
    : EMPLOYEE_EDITABLE_FIELDS;

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No editable fields supplied." });
  }

  const setClause = Object.keys(updates)
    .map((f) => `${f} = @${f}`)
    .join(", ");

  const existing = db.prepare("SELECT id FROM profiles WHERE user_id = ?").get(targetId);
  if (!existing) {
    return res.status(404).json({ error: "Profile not found." });
  }

  db.prepare(`UPDATE profiles SET ${setClause} WHERE user_id = @user_id`).run({
    ...updates,
    user_id: targetId,
  });

  res.json({ profile: getProfileRow(targetId) });
});

module.exports = router;
