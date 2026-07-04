-- HRMS Database Schema (SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id    TEXT UNIQUE NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('employee', 'admin')) DEFAULT 'employee',
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name       TEXT,
  last_name        TEXT,
  phone            TEXT,
  address          TEXT,
  department       TEXT,
  job_title        TEXT,
  date_of_joining  DATE,
  profile_picture  TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  check_in   DATETIME,
  check_out  DATETIME,
  status     TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half-day', 'leave')) DEFAULT 'present',
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type    TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  reason        TEXT,
  status        TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_comment TEXT,
  reviewed_by   INTEGER REFERENCES users(id),
  created_at    DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payroll (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month         TEXT NOT NULL,
  basic_salary  REAL NOT NULL DEFAULT 0,
  allowances    REAL NOT NULL DEFAULT 0,
  deductions    REAL NOT NULL DEFAULT 0,
  net_salary    REAL NOT NULL DEFAULT 0,
  updated_by    INTEGER REFERENCES users(id),
  updated_at    DATETIME NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_user_month ON payroll(user_id, month);
