const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");
const { authMiddleware, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function nextEmployeeId(role) {
  const row = db.prepare("SELECT COUNT(*) as count FROM users").get();
  const n = row.count + 1;
  const prefix = role === "admin" ? "ADM" : "EMP";
  return `${prefix}${String(n).padStart(3, "0")}`;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, employee_id: user.employee_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  const chosenRole = role === "admin" ? "admin" : "employee";

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const employee_id = nextEmployeeId(chosenRole);

  const insertUser = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO users (employee_id, email, password_hash, role, email_verified)
         VALUES (?, ?, ?, ?, 1)` // simulated auto-verify, per implementation plan
      )
      .run(employee_id, email.toLowerCase(), password_hash, chosenRole);

    db.prepare(
      `INSERT INTO profiles (user_id, first_name, last_name) VALUES (?, ?, ?)`
    ).run(info.lastInsertRowid, first_name || "", last_name || "");

    return info.lastInsertRowid;
  });

  const userId = insertUser();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  const token = signToken(user);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      employee_id: user.employee_id,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (role && role !== user.role) {
    return res.status(403).json({ error: `This account is registered as ${user.role}, not ${role}.` });
  }

  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      employee_id: user.employee_id,
      email: user.email,
      role: user.role,
    },
  });
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT id, employee_id, email, role, email_verified, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user });
});

module.exports = router;