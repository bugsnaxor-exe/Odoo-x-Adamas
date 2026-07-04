// Seed script: creates a demo admin and demo employees with sample data.
// Run with: npm run seed
const bcrypt = require("bcryptjs");
const db = require("./database");

function upsertUser({ employee_id, email, password, role }) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return existing.id;
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      `INSERT INTO users (employee_id, email, password_hash, role, email_verified)
       VALUES (?, ?, ?, ?, 1)`
    )
    .run(employee_id, email, hash, role);
  return info.lastInsertRowid;
}

function upsertProfile(userId, profile) {
  const existing = db.prepare("SELECT id FROM profiles WHERE user_id = ?").get(userId);
  if (existing) return;
  db.prepare(
    `INSERT INTO profiles (user_id, first_name, last_name, phone, address, department, job_title, date_of_joining, profile_picture)
     VALUES (@user_id, @first_name, @last_name, @phone, @address, @department, @job_title, @date_of_joining, @profile_picture)`
  ).run({ user_id: userId, ...profile });
}

const admin = upsertUser({
  employee_id: "EMP001",
  email: "admin@hrms.local",
  password: "Admin@123",
  role: "admin",
});
upsertProfile(admin, {
  first_name: "Ava",
  last_name: "Admin",
  phone: "555-0100",
  address: "1 Corporate Way",
  department: "Human Resources",
  job_title: "HR Manager",
  date_of_joining: "2022-01-10",
  profile_picture: null,
});

const employees = [
  {
    employee_id: "EMP002",
    email: "employee1@hrms.local",
    password: "Employee@123",
    profile: {
      first_name: "Liam",
      last_name: "Carter",
      phone: "555-0101",
      address: "22 Market St",
      department: "Engineering",
      job_title: "Software Engineer",
      date_of_joining: "2023-03-15",
      profile_picture: null,
    },
  },
  {
    employee_id: "EMP003",
    email: "employee2@hrms.local",
    password: "Employee@123",
    profile: {
      first_name: "Maya",
      last_name: "Singh",
      phone: "555-0102",
      address: "48 Park Ave",
      department: "Design",
      job_title: "UI/UX Designer",
      date_of_joining: "2023-07-01",
      profile_picture: null,
    },
  },
];

const empIds = [];
for (const e of employees) {
  const id = upsertUser({ employee_id: e.employee_id, email: e.email, password: e.password, role: "employee" });
  upsertProfile(id, e.profile);
  empIds.push(id);
}

// Sample attendance for last 5 days
const today = new Date();
for (const uid of empIds) {
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = db.prepare("SELECT id FROM attendance WHERE user_id = ? AND date = ?").get(uid, dateStr);
    if (!existing) {
      db.prepare(
        `INSERT INTO attendance (user_id, date, check_in, check_out, status)
         VALUES (?, ?, ?, ?, 'present')`
      ).run(uid, dateStr, `${dateStr}T09:0${uid}:00`, `${dateStr}T18:0${uid}:00`);
    }
  }
}

// Sample leave request
const existingLeave = db.prepare("SELECT id FROM leave_requests WHERE user_id = ?").get(empIds[0]);
if (!existingLeave) {
  db.prepare(
    `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
     VALUES (?, 'sick', ?, ?, 'Feeling unwell', 'pending')`
  ).run(empIds[0], "2026-07-10", "2026-07-11");
}

// Sample payroll for current month
const month = today.toISOString().slice(0, 7);
for (const uid of empIds) {
  const existing = db.prepare("SELECT id FROM payroll WHERE user_id = ? AND month = ?").get(uid, month);
  if (!existing) {
    const basic = 50000;
    const allowances = 8000;
    const deductions = 3000;
    db.prepare(
      `INSERT INTO payroll (user_id, month, basic_salary, allowances, deductions, net_salary, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(uid, month, basic, allowances, deductions, basic + allowances - deductions, admin);
  }
}

console.log("Seed complete.");
console.log("Admin login:    admin@hrms.local / Admin@123");
console.log("Employee login: employee1@hrms.local / Employee@123");
console.log("Employee login: employee2@hrms.local / Employee@123");
