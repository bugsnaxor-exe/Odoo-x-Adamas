// ============================================
// Profile Routes — View & Update Employee Profiles
// ============================================
const express = require('express');
const router = express.Router();
const db = require('../db/database.js');
const auth = require('../middleware/auth.js');
const roleGuard = require('../middleware/roleGuard.js');

// All profile routes require authentication
router.use(auth);

// -----------------------------------------
// GET / — List all employees with profiles
// Admin only
// -----------------------------------------
router.get('/', roleGuard('admin'), (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT
        u.id, u.email, u.role, u.created_at,
        p.first_name, p.last_name, p.phone, p.address,
        p.department, p.job_title, p.date_of_joining,
        p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
    `).all();

    res.json(employees);
  } catch (err) {
    console.error('Error fetching all profiles:', err.message);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// -----------------------------------------
// GET /:id — View a specific employee profile
// Employees can only view their own; admins can view any
// -----------------------------------------
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Employees can only view their own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied — you can only view your own profile' });
    }

    const profile = db.prepare(`
      SELECT
        u.id, u.email, u.role, u.created_at,
        p.first_name, p.last_name, p.phone, p.address,
        p.department, p.job_title, p.date_of_joining,
        p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(id);

    if (!profile) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// -----------------------------------------
// PUT /:id — Update an employee profile
// Employees: own profile, limited fields (phone, address, profile_picture)
// Admins: any profile, all fields
// -----------------------------------------
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const isAdmin = req.user.role === 'admin';

    // Employees can only edit their own profile
    if (!isAdmin && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied — you can only edit your own profile' });
    }

    // Define which fields are allowed based on role
    const employeeFields = ['phone', 'address', 'profile_picture'];
    const adminFields = [
      'first_name', 'last_name', 'phone', 'address',
      'department', 'job_title', 'date_of_joining', 'profile_picture'
    ];
    const allowedFields = isAdmin ? adminFields : employeeFields;

    // Build dynamic SET clause from allowed fields present in the request body
    const updates = [];
    const values = [];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    // Add user_id for the WHERE clause
    values.push(id);

    const result = db.prepare(`
      UPDATE profiles
      SET ${updates.join(', ')}
      WHERE user_id = ?
    `).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Return the updated profile
    const updatedProfile = db.prepare(`
      SELECT
        u.id, u.email, u.role, u.created_at,
        p.first_name, p.last_name, p.phone, p.address,
        p.department, p.job_title, p.date_of_joining,
        p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(id);

    res.json(updatedProfile);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
