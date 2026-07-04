// ============================================================
// seed.js — Populate the HRMS database with sample data
// Run:  npm run seed   (or  node db/seed.js)
// Safe to run multiple times — clears existing data first.
// ============================================================
const db = require('./database');
const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Hash a plain-text password (sync — fine for a seed script) */
const hash = (pw) => bcrypt.hashSync(pw, 10);

/** Return a random element from an array */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Format a JS Date as YYYY-MM-DD */
const fmtDate = (d) => d.toISOString().split('T')[0];

/** Format a JS Date as YYYY-MM-DD HH:MM:SS */
const fmtDateTime = (d) => d.toISOString().replace('T', ' ').substring(0, 19);

/** Return the current month string as YYYY-MM */
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// 1. Clear all tables (FK-safe order: children first)
// ---------------------------------------------------------------------------
console.log('🗑️  Clearing existing data…');
db.exec(`
  DELETE FROM payroll;
  DELETE FROM leave_requests;
  DELETE FROM attendance;
  DELETE FROM profiles;
  DELETE FROM users;
`);

// ---------------------------------------------------------------------------
// 2. Insert users
// ---------------------------------------------------------------------------
console.log('👤 Creating users…');

const insertUser = db.prepare(`
  INSERT INTO users (employee_id, email, password_hash, role)
  VALUES (@employee_id, @email, @password_hash, @role)
`);

const users = [
  { employee_id: 'ADM001', email: 'sayantan05072004@gmail.com', password_hash: hash('Admin@123'),    role: 'admin' },
  { employee_id: 'EMP001', email: 'ankushbiswas2704@gmail.com',  password_hash: hash('Employee@123'), role: 'employee' },
  { employee_id: 'EMP002', email: 'sayatan05092004@gmail.com',   password_hash: hash('Employee@123'), role: 'employee' },
  { employee_id: 'EMP003', email: 'sayan05072004@gmail.com',      password_hash: hash('Employee@123'), role: 'employee' },
];

const insertUsers = db.transaction(() => {
  for (const u of users) insertUser.run(u);
});
insertUsers();

// Fetch inserted user IDs
const allUsers = db.prepare('SELECT id, employee_id, role FROM users ORDER BY id').all();
const adminId = allUsers.find((u) => u.role === 'admin').id;
console.log(`   ✅ ${allUsers.length} users created (admin id=${adminId})`);

// ---------------------------------------------------------------------------
// 3. Insert profiles — realistic Indian names & departments
// ---------------------------------------------------------------------------
console.log('📋 Creating profiles…');

const insertProfile = db.prepare(`
  INSERT INTO profiles
    (user_id, first_name, last_name, phone, address, department, job_title, date_of_joining)
  VALUES
    (@user_id, @first_name, @last_name, @phone, @address, @department, @job_title, @date_of_joining)
`);

const profileData = [
  {
    employee_id: 'ADM001',
    first_name: 'Riju',
    last_name: 'Dasgupta',
    phone: '+91-9876543210',
    address: '12, MG Road, Bengaluru, Karnataka 560001',
    department: 'HR',
    job_title: 'HR Manager',
    date_of_joining: '2022-01-15',
  },
  {
    employee_id: 'EMP001',
    first_name: 'Ankush',
    last_name: 'Biswas',
    phone: '+91-9123456780',
    address: '45, Nehru Nagar, Pune, Maharashtra 411001',
    department: 'Engineering',
    job_title: 'Software Engineer',
    date_of_joining: '2023-03-10',
  },
  {
    employee_id: 'EMP002',
    first_name: 'Sayantan',
    last_name: 'Dasgupta',
    phone: '+91-9988776655',
    address: '78, Sector 22, Gurugram, Haryana 122015',
    department: 'Design',
    job_title: 'UI/UX Designer',
    date_of_joining: '2023-06-01',
  },
  {
    employee_id: 'EMP003',
    first_name: 'Swastick',
    last_name: 'Saha',
    phone: '+91-9012345678',
    address: '23, Anna Salai, Chennai, Tamil Nadu 600002',
    department: 'Finance',
    job_title: 'Financial Analyst',
    date_of_joining: '2024-01-20',
  },
];

const insertProfiles = db.transaction(() => {
  for (const p of profileData) {
    const user = allUsers.find((u) => u.employee_id === p.employee_id);
    insertProfile.run({
      user_id: user.id,
      first_name: p.first_name,
      last_name: p.last_name,
      phone: p.phone,
      address: p.address,
      department: p.department,
      job_title: p.job_title,
      date_of_joining: p.date_of_joining,
    });
  }
});
insertProfiles();
console.log(`   ✅ ${profileData.length} profiles created`);

// ---------------------------------------------------------------------------
// 4. Attendance records — last 7 days for each employee
// ---------------------------------------------------------------------------
console.log('📅 Creating attendance records…');

const insertAttendance = db.prepare(`
  INSERT INTO attendance (user_id, date, check_in, check_out, status)
  VALUES (@user_id, @date, @check_in, @check_out, @status)
`);

const statuses = ['present', 'present', 'present', 'present', 'absent', 'half-day'];
// Weighted toward "present" so the data looks realistic

const employeeUsers = allUsers.filter((u) => u.role === 'employee');
let attendanceCount = 0;

const insertAttendances = db.transaction(() => {
  for (const emp of employeeUsers) {
    for (let i = 1; i <= 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);

      const status = pick(statuses);

      // Build check-in / check-out times based on status
      let checkIn = null;
      let checkOut = null;

      if (status === 'present') {
        const cin = new Date(day);
        cin.setHours(9, Math.floor(Math.random() * 30), 0);
        checkIn = fmtDateTime(cin);

        const cout = new Date(day);
        cout.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
        checkOut = fmtDateTime(cout);
      } else if (status === 'half-day') {
        const cin = new Date(day);
        cin.setHours(9, Math.floor(Math.random() * 15), 0);
        checkIn = fmtDateTime(cin);

        const cout = new Date(day);
        cout.setHours(13, Math.floor(Math.random() * 30), 0);
        checkOut = fmtDateTime(cout);
      }
      // absent → both null

      insertAttendance.run({
        user_id: emp.id,
        date: fmtDate(day),
        check_in: checkIn,
        check_out: checkOut,
        status,
      });
      attendanceCount++;
    }
  }
});
insertAttendances();
console.log(`   ✅ ${attendanceCount} attendance records created`);

// ---------------------------------------------------------------------------
// 5. Leave requests — 1 pending, 1 approved, 1 rejected
// ---------------------------------------------------------------------------
console.log('🏖️  Creating leave requests…');

const insertLeave = db.prepare(`
  INSERT INTO leave_requests
    (user_id, leave_type, start_date, end_date, reason, status, admin_comment, reviewed_by)
  VALUES
    (@user_id, @leave_type, @start_date, @end_date, @reason, @status, @admin_comment, @reviewed_by)
`);

const leaveData = [
  {
    user_id: employeeUsers[0].id,
    leave_type: 'paid',
    start_date: '2026-07-10',
    end_date: '2026-07-12',
    reason: 'Family function in hometown',
    status: 'pending',
    admin_comment: '',
    reviewed_by: null,
  },
  {
    user_id: employeeUsers[1].id,
    leave_type: 'sick',
    start_date: '2026-06-20',
    end_date: '2026-06-21',
    reason: 'Fever and body ache',
    status: 'approved',
    admin_comment: 'Get well soon. Approved.',
    reviewed_by: adminId,
  },
  {
    user_id: employeeUsers[2].id,
    leave_type: 'unpaid',
    start_date: '2026-06-25',
    end_date: '2026-06-30',
    reason: 'Personal travel plans',
    status: 'rejected',
    admin_comment: 'Project deadline approaching, cannot approve extended leave.',
    reviewed_by: adminId,
  },
];

const insertLeaves = db.transaction(() => {
  for (const l of leaveData) insertLeave.run(l);
});
insertLeaves();
console.log(`   ✅ ${leaveData.length} leave requests created`);

// ---------------------------------------------------------------------------
// 6. Payroll records — current month for every user
// ---------------------------------------------------------------------------
console.log('💰 Creating payroll records…');

const insertPayroll = db.prepare(`
  INSERT INTO payroll
    (user_id, month, basic_salary, allowances, deductions, net_salary, updated_by)
  VALUES
    (@user_id, @month, @basic_salary, @allowances, @deductions, @net_salary, @updated_by)
`);

const payrollData = [
  { employee_id: 'ADM001', basic: 85000, allowances: 15000, deductions: 8500 },
  { employee_id: 'EMP001', basic: 70000, allowances: 12000, deductions: 7000 },
  { employee_id: 'EMP002', basic: 55000, allowances: 10000, deductions: 5500 },
  { employee_id: 'EMP003', basic: 65000, allowances: 11000, deductions: 6500 },
];

const month = currentMonth();

const insertPayrolls = db.transaction(() => {
  for (const p of payrollData) {
    const user = allUsers.find((u) => u.employee_id === p.employee_id);
    insertPayroll.run({
      user_id: user.id,
      month,
      basic_salary: p.basic,
      allowances: p.allowances,
      deductions: p.deductions,
      net_salary: p.basic + p.allowances - p.deductions,
      updated_by: adminId,
    });
  }
});
insertPayrolls();
console.log(`   ✅ ${payrollData.length} payroll records created (month: ${month})`);

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
console.log('\n🎉 Seed complete — database is ready to use!');
