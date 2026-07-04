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
// GET / (and /all) — List all employees with profiles
// Admin only
// -----------------------------------------
router.get(['/', '/all'], (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const sql = `
      SELECT
        u.id, u.email, u.role, u.created_at,
        p.first_name, p.last_name, p.phone, p.address,
        p.department, p.job_title, p.date_of_joining,
        p.profile_picture
        ${isAdmin ? ', (SELECT basic_salary FROM payroll WHERE user_id = u.id ORDER BY month DESC LIMIT 1) AS salary' : ''}
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
    `;
    const employees = db.prepare(sql).all();
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
        p.profile_picture,
        (SELECT basic_salary FROM payroll WHERE user_id = u.id ORDER BY month DESC LIMIT 1) AS salary
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

    // Execute profiles table updates if any profile field was changed
    if (updates.length > 0) {
      values.push(id);
      db.prepare(`
        UPDATE profiles
        SET ${updates.join(', ')}
        WHERE user_id = ?
      `).run(...values);
    }

    // If salary is updated by an admin, upsert it in the payroll table for the current month
    if (isAdmin && req.body.salary !== undefined) {
      const basicSalary = parseFloat(req.body.salary) || 0;
      const finalAllowances = basicSalary * 0.12;
      const finalDeductions = basicSalary * 0.08;
      const netSalary = basicSalary + finalAllowances - finalDeductions;
      
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      db.prepare(`
        INSERT INTO payroll (user_id, month, basic_salary, allowances, deductions, net_salary, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, month) DO UPDATE SET
          basic_salary = excluded.basic_salary,
          allowances   = excluded.allowances,
          deductions   = excluded.deductions,
          net_salary   = excluded.net_salary,
          updated_by   = excluded.updated_by
      `).run(id, monthStr, basicSalary, finalAllowances, finalDeductions, netSalary, req.user.id);
    }

    // Return the updated profile
    const updatedProfile = db.prepare(`
      SELECT
        u.id, u.email, u.role, u.created_at,
        p.first_name, p.last_name, p.phone, p.address,
        p.department, p.job_title, p.date_of_joining,
        p.profile_picture,
        (SELECT basic_salary FROM payroll WHERE user_id = u.id ORDER BY month DESC LIMIT 1) AS salary
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
