-- ============================================================
-- HRMS Database Schema
-- SQLite — all tables use IF NOT EXISTS for idempotent runs
-- ============================================================

-- Users table — central identity & authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('employee', 'admin')),
  email_verified INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table — 1-to-1 with users, stores personal/HR details
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  department TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  date_of_joining DATE DEFAULT '',
  profile_picture TEXT DEFAULT '',
  documents TEXT DEFAULT '[]'
);

-- Attendance table — one row per user per day
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  status TEXT NOT NULL DEFAULT 'absent' CHECK(status IN ('present', 'absent', 'half-day', 'leave')),
  UNIQUE(user_id, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK(leave_type IN ('paid', 'sick', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  admin_comment TEXT DEFAULT '',
  reviewed_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payroll table — one row per user per month
CREATE TABLE IF NOT EXISTS payroll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  basic_salary REAL NOT NULL DEFAULT 0,
  allowances REAL NOT NULL DEFAULT 0,
  deductions REAL NOT NULL DEFAULT 0,
  net_salary REAL NOT NULL DEFAULT 0,
  updated_by INTEGER REFERENCES users(id),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);

-- ============================================================
-- Performance Indexes
-- ============================================================

-- Attendance: speed up lookups by user and by date
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date    ON attendance(date);

-- Leave requests: speed up per-user queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);

-- Payroll: speed up per-user queries
CREATE INDEX IF NOT EXISTS idx_payroll_user_id ON payroll(user_id);
