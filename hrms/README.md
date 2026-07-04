# HRMS — Human Resource Management System

Full-stack HRMS built per the implementation plan: React (Vite) frontend, Node.js + Express backend, SQLite (`better-sqlite3`) database, JWT auth.

## Project Structure

```
hrms/
├── client/     # React (Vite) frontend
└── server/     # Express + SQLite backend
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # edit JWT_SECRET if you like
npm run seed               # creates demo admin + employees + sample data
npm run dev                # starts on http://localhost:5000
```

Demo accounts (created by `npm run seed`):
- **Admin:** `admin@hrms.local` / `Admin@123`
- **Employee:** `employee1@hrms.local` / `Employee@123`
- **Employee:** `employee2@hrms.local` / `Employee@123`

The SQLite database file is created automatically at `server/db/hrms.sqlite3` on first run.

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts on http://localhost:5173
```

Vite is configured to proxy `/api/*` requests to `http://localhost:5000`, so no CORS setup is needed in dev.

## Features implemented

- **Auth:** signup (auto-verified, per plan), login, JWT-protected `/me`
- **Profile:** view/edit own profile; employees can edit personal fields only, admins can edit department/job title/join date too; admin employee directory
- **Attendance:** check-in/check-out, personal history, admin daily/weekly/all views
- **Leave:** apply (paid/sick/unpaid), personal history, admin approve/reject with comment (approval auto-marks attendance as "leave" for the date range)
- **Payroll:** employee read-only view, admin editable salary structure (basic/allowances/deductions → auto-computed net)

## Notes on the two flagged decisions from the plan

- **SQLite** is used (no server setup required) — swap for Postgres later by replacing `server/db/database.js` and `schema.sql` if needed.
- **Email verification** is simulated: accounts are auto-verified (`email_verified = 1`) on signup rather than sending a real email.

## Manual verification checklist

1. Sign up as a new employee → redirected to dashboard → refresh → still logged in
2. Log in as admin → see employee directory + pending leave stat on dashboard
3. Edit profile as employee (limited fields) vs. as admin (all fields)
4. Check in → check out → confirm it appears in "My History" and admin's "All Employees" view
5. Apply for leave as employee → approve as admin → confirm attendance flips to "leave" for those dates
6. View payroll as employee (read-only) → edit salary as admin → confirm net salary recalculates
