// ============================================
// Auth Routes — Signup, Login, Me
// ============================================
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../db/database.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

// ---------------------
// Helper: Generate JWT
// ---------------------
/**
 * Creates a signed JWT with a 24-hour expiry.
 * Payload includes: id, employee_id, email, role
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      employee_id: user.employee_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// ---------------------
// Helper: Validate Email
// ---------------------
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ---------------------
// Helper: Validate Password Strength
// ---------------------
/**
 * Password requirements:
 *  - Minimum 8 characters
 *  - At least 1 uppercase letter
 *  - At least 1 number
 *  - At least 1 special character
 */
const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
};

// ============================
// POST /signup — Register user
// ============================
router.post('/signup', (req, res) => {
  try {
    const { employee_id, email, password, role } = req.body;

    // --- Validate required fields ---
    if (!employee_id || !email || !password || !role) {
      return res.status(400).json({
        error: 'All fields are required: employee_id, email, password, role.',
      });
    }

    // --- Validate email format ---
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // --- Validate password strength ---
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters and include at least 1 uppercase letter, 1 number, and 1 special character.',
      });
    }

    // --- Check if employee_id already exists ---
    const existingEmployee = db
      .prepare('SELECT id FROM users WHERE employee_id = ?')
      .get(employee_id);

    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee ID already exists.' });
    }

    // --- Check if email already exists ---
    const existingEmail = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // --- Hash the password ---
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // --- Insert new user into DB ---
    const insertUser = db.prepare(
      'INSERT INTO users (employee_id, email, password_hash, role) VALUES (?, ?, ?, ?)'
    );
    const result = insertUser.run(employee_id, email, hashedPassword, role);
    const userId = result.lastInsertRowid;

    // --- Create an empty profile for the new user ---
    const insertProfile = db.prepare(
      'INSERT INTO profiles (user_id) VALUES (?)'
    );
    insertProfile.run(userId);

    // --- Build the user object for response ---
    const user = {
      id: userId,
      employee_id,
      email,
      role,
    };

    // --- Generate JWT ---
    const token = generateToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ error: 'Internal server error during signup.' });
  }
});

// ============================
// POST /login — Authenticate
// ============================
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validate required fields ---
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
      });
    }

    // --- Find user by email ---
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // --- Compare password ---
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // --- Generate JWT ---
    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ============================
// GET /me — Current user info
// ============================
router.get('/me', auth, (req, res) => {
  try {
    // --- Fetch user joined with profile ---
    const user = db
      .prepare(
        `SELECT
           u.id,
           u.employee_id,
           u.email,
           u.role,
           u.created_at,
           p.first_name,
           p.last_name,
           p.phone,
           p.address,
           p.department,
           p.job_title,
           p.date_of_joining,
           p.profile_picture,
           p.documents
         FROM users u
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE u.id = ?`
      )
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('Get me error:', err.message);
    return res.status(500).json({ error: 'Internal server error fetching user info.' });
  }
});

module.exports = router;
