// client/src/services/api.js

const BASE_URL = 'http://localhost:5000/api';

// --- LOCAL STORAGE MOCK DB FALLBACK ---
// This ensures that the frontend remains fully functional in the browser 
// even if the backend server is offline or not yet fully implemented.

const INITIAL_EMPLOYEES = [
  {
    id: 1,
    employeeId: 'EMP001',
    name: 'Elena Rodriguez',
    role: 'admin',
    jobTitle: 'Project Lead / HR',
    department: 'Management',
    email: 'elena.rodriguez@peoplehub.com',
    phone: '+1 (555) 123-4567',
    address: '456 Leadership Blvd, San Francisco, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJEPQOhs6hx6nWexvdHp2DyhpUIyi6F_JsG89EOgp9TF6OajZiSN_MsXrv-9uTZNdXhWAbI7WL4eC5Jnyo4Wj0-7yOrVmTU5PptDjIh1siUhvnlJJrmyX1aFQEBtolLqMC7si5sFYgTAIccx9CuT-IEJgbOt-6iDBVWoIGQyl88NfFb3Q-6FDrS6iOMzl6ZV2Mfqcn7sl7lIgl_wAFkJmWRLrHITQJvr7YHTy45EpJCNwL7wgczDnmDA',
    salary: 12500,
    tags: ['Management', 'HR'],
    status: 'Present',
    dateOfJoining: '2022-01-15'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: 'Sarah Jenkins',
    role: 'employee',
    jobTitle: 'Senior UI Designer',
    department: 'Design',
    email: 'sarah.jenkins@peoplehub.com',
    phone: '+1 (555) 234-5678',
    address: '123 Creative Studio Way, San Francisco, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUmad-dVuwzDgqEj-xknLKG3lZmQBS7zcsHxVnMEDCX21eMvFGc0vr0jLppvsGuHZpmajKPjCCnxLed-MGkwTkjY15XMhNf1jqH8IWI0ayddA3Hi2e7AsQ1JsyiQTWdraE96bY-ti4qUXFmwOrMPpEb8tXOG8a6PlBjd-q7LJLi4m2R4JITqjcFjZn2KJuJGVREKjkUwXpnVkUatahUL22QkWFs2AObF50ytRrVoigVN7xwg-ZrE9IlQ',
    salary: 8450,
    tags: ['Figma', 'UI/UX'],
    status: 'Present',
    dateOfJoining: '2023-04-10'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: 'David Chen',
    role: 'employee',
    jobTitle: 'Data Analyst',
    department: 'Product',
    email: 'david.chen@peoplehub.com',
    phone: '+1 (555) 345-6789',
    address: '789 Analytics Rd, San Jose, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALK4y8BNUgJWG6L2ou9mR3rS3Q8yJZloruZ3qZL8BI29e7B2VwUdTu11LS1RZfaEZFkadtNb2Lb_vsm5gW0sdeiTO-Xp9gXgX47cveo7Qg3pSpz0tLFAgVsf4p2uFGOd0J_wjfcw2T3tC_04BI_ouG86AZFXHJaS01OFl70mV3mWLGTVepJ0xB-MXMQfjV0P5Rr4Yu61MehznnVYD9XER1-rh9ux31XJ3uIlZS9CLzGf33RVREvYkeYQ',
    salary: 7200,
    tags: ['SQL', 'Python', 'Analytics'],
    status: 'On Leave',
    dateOfJoining: '2023-08-01'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    name: 'Alex Rivera',
    role: 'employee',
    jobTitle: 'Lead Frontend Engineer',
    department: 'Engineering',
    email: 'alex.rivera@peoplehub.com',
    phone: '+1 (555) 456-7890',
    address: '101 React Way, Oakland, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC5Km56qpvL-WHFeVO3kQc5LI5gbbBLbAh7b-ZjPSKjcMvQ1xS8AKRRgOfZBCq4rKTqvV_XS0e3REgB7outLUsO7knOAVpvsmqjwhsOHdBqL_0WeuThJIfCDQ2VfSyZ151rqC9Lk9ikkPnExjPopVqUBYpFj7k9YpkECRy-LMuzJwYY5VoASzNgRkQ7cfchwfqPgcPsslH2wCHhUInF6Tvld_1_UBqx9kKezHPdflQIEZsHsZiPIxlOw',
    salary: 9800,
    tags: ['React', 'Tailwind'],
    status: 'Present',
    dateOfJoining: '2022-05-20'
  },
  {
    id: 5,
    employeeId: 'EMP005',
    name: 'Sarah Chen',
    role: 'employee',
    jobTitle: 'Senior Product Designer',
    department: 'Design',
    email: 'sarah.chen@peoplehub.com',
    phone: '+1 (555) 567-8901',
    address: '202 Figma St, San Francisco, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaqWKv9v9gGEnFVRUcnZUY-H0SadaekotsHTHomoSz9y4ybs6UlqqxwtOpoWscwX1NPRLmH8pBI8Oim_enO2Ns7Itm2pZqcsj4sYpbBlexVfphzTle25C7vr6FDk8ZDg37nlxFZZTPBOxuU0FB9ZYTK8ODm0lUpKbaYHySY4Z4TqFViWDYRy0HNtcOjG2P4DjjrzGlt9iXTMpyhI3uYQiaBiElcVyZewFpPWP68FrFyjzGy3-vwzCUyA',
    salary: 9200,
    tags: ['Figma', 'UX'],
    status: 'Present',
    dateOfJoining: '2022-11-01'
  },
  {
    id: 6,
    employeeId: 'EMP006',
    name: 'Marcus Thorne',
    role: 'employee',
    jobTitle: 'Operations Manager',
    department: 'Management',
    email: 'marcus.thorne@peoplehub.com',
    phone: '+1 (555) 678-9012',
    address: '303 Strategy Dr, Berkeley, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJc1vHCH_qwShEpevCZ_7ePKL6vu6Ps4CI43PKSq1MNfUO_uDUKmH-Q9oxjwSfnb0pz9OdQbOabsTmrya-049X5BZLJU28Lp-zbhJ8J4veoD1vTvtMauf-EG5ac-JRuy21piLghrswf9IFD33FvrnA-Vwhro71OH2eIaB0-R9zHtIHdyS_7E52rworTHpBqPbxa2LEgnOV15s6DETcDGcM-GHMn410eL55KNE1vwrj8IAbtjhU85jodg',
    salary: 8900,
    tags: ['Strategy', 'Lean'],
    status: 'Out of Office',
    dateOfJoining: '2021-06-15'
  },
  {
    id: 7,
    employeeId: 'EMP007',
    name: 'Elena Vostova',
    role: 'employee',
    jobTitle: 'Marketing Specialist',
    department: 'Product',
    email: 'elena.vostova@peoplehub.com',
    phone: '+1 (555) 789-0123',
    address: '404 Ads Ave, San Francisco, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFd8MbM4ozBQSOp6v6F8zUOcUEHmMgT7E1fvYqYBHd6GswZruhDvHkjIwF_kuqzT3biu46-w9HrnLvN-kDpAdkIQ1zNMfbQBs2UXufnbRjH2-_uKIvUDgmuFTyKZ55V1cUAlH0mMhYSX8Vm7fiFO5bDocS7WxrS66whRefDoF8P83QEK0N5rRSKCyovFO_ElHOyqu8hqCyE4kxkqQE2x4ctyGHx2uiC3Csbp9HpM6KFE8ps_6MsCrVrA',
    salary: 6500,
    tags: ['Growth', 'Ads'],
    status: 'Present',
    dateOfJoining: '2024-02-10'
  },
  {
    id: 8,
    employeeId: 'EMP008',
    name: 'Jordan Smith',
    role: 'employee',
    jobTitle: 'QA Engineer',
    department: 'Engineering',
    email: 'jordan.smith@peoplehub.com',
    phone: '+1 (555) 890-1234',
    address: '505 Test Ln, Redwood City, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ4BVyGziGPZhYWZla0xqH7LbJPU_6TanG4qMkI7AzN2QgQWZN-93DLBvHnwnrJZk9O-4-Hq875pJn8FQVQ_r1xTVkjnFX8H4F4MLrIesMRo8CSpEQSZ8wFa7kLkx964lZD4I1kJkuiF8sqpUnYorMJaspkDlRNhnQm2hLnGLtHp8VYyOzY8RC37dXWV2nKdY58JV7wc2qfoF_fP6ElP-pazuTxoQr1Q7aABJpQtLmSkK7p0GK1wYl9A',
    salary: 7800,
    tags: ['Testing', 'Java'],
    status: 'Present',
    dateOfJoining: '2023-01-20'
  },
  {
    id: 9,
    employeeId: 'EMP009',
    name: 'Dr. Lisa Wong',
    role: 'employee',
    jobTitle: 'Data Science Director',
    department: 'Product',
    email: 'lisa.wong@peoplehub.com',
    phone: '+1 (555) 901-2345',
    address: '606 AI Dr, Palo Alto, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOUfgyDBLlyvqjzFoonZ0LQSDDfBCyROca1u_BiUWPiW1uUI5SAvOE8aApnVwq3_7cBjR_LpcJOGBaQZhgHqed1fB_jRnglm_vGGnvMujKbLeIeMTKMSHTo_rMBIAhM4e6bj0Yda8G3LSLqMa-c6t7iV0rEOZx7GtwZ-qNWq9iKTqY500pHA-_B1riHCkSt79zVwAvW3h_1jjkNpIL8JiHnd2F0iqe7kI3PD4A95HKKcjWbQItBq7zNQ',
    salary: 15000,
    tags: ['AI/ML', 'Python'],
    status: 'Present',
    dateOfJoining: '2021-09-01'
  },
  {
    id: 10,
    employeeId: 'EMP010',
    name: 'Taylor Kim',
    role: 'employee',
    jobTitle: 'Talent Acquisition',
    department: 'Product',
    email: 'taylor.kim@peoplehub.com',
    phone: '+1 (555) 012-3456',
    address: '707 Culture Ct, San Francisco, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJCmEIfFFlZy69T0laMwMswmvuTzkvAkLW1vxYHHsbJZihT03Zt8XVg6Sz0dP07zKY9MPjY9GO3DKg-XEpZJYA1WXf9KqIQH9E_0-wHwjR0oZQC8n3PoWADnZqqaj3Yi7F5Hwhhpo_LPtTieWObbUPfuzPK8aFHy5aSRpAdlGd1zUuuBd3WRg7yipT-MuLxXMrfDMmxXM4Gx1ADtn9PhVaFuLxZdV7F1mzK5iEcPtR5yxMdbIaQBJyLw',
    salary: 7500,
    tags: ['HR', 'Culture'],
    status: 'Present',
    dateOfJoining: '2023-06-12'
  },
  {
    id: 11,
    employeeId: 'EMP011',
    name: 'Priya Sharma',
    role: 'employee',
    jobTitle: 'Cloud Architect',
    department: 'Engineering',
    email: 'priya.sharma@peoplehub.com',
    phone: '+1 (555) 123-9876',
    address: '808 AWS Ave, Sunnyvale, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAP3SiMKMYtWYkfi2YRmFmDd4_d61n02GzOen_GJ1SkRkFtRl7pCLUBEiiwxrAHh1TfLHOBnRYbwZGOLtPpiSZpcyHC-1asnRuLsnb55mdAgEUUqNPBQ0JZ4hJNXZ5GrtDZWC6XJLx0jMBtO96bSjhb_ssmtQAB_ESRN499lVsJ8UoMjSiVxCDNBrVHgqhPZoYVP_BdO9VabOleSEAYQdd3w1bQb2C6r4T28gl2qLZRLSlOkDhR2kcBbg',
    salary: 11500,
    tags: ['AWS', 'Kubernetes'],
    status: 'Present',
    dateOfJoining: '2022-09-01'
  }
];

const INITIAL_LEAVES = [
  {
    id: 1,
    userId: 2, // Sarah Jenkins (users.id)
    employeeId: 'EMP002',
    employeeName: 'Sarah Jenkins',
    employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUmad-dVuwzDgqEj-xknLKG3lZmQBS7zcsHxVnMEDCX21eMvFGc0vr0jLppvsGuHZpmajKPjCCnxLed-MGkwTkjY15XMhNf1jqH8IWI0ayddA3Hi2e7AsQ1JsyiQTWdraE96bY-ti4qUXFmwOrMPpEb8tXOG8a6PlBjd-q7LJLi4m2R4JITqjcFjZn2KJuJGVREKjkUwXpnVkUatahUL22QkWFs2AObF50ytRrVoigVN7xwg-ZrE9IlQ',
    leaveType: 'sick',
    startDate: '2024-10-05',
    endDate: '2024-10-05',
    duration: '1 Day',
    status: 'approved',
    reason: 'Medical checkup',
    submittedOn: 'Oct 05, 2024',
    reviewedBy: 'Emma Wilson'
  },
  {
    id: 2,
    userId: 6, // Marcus Thorne
    employeeId: 'EMP006',
    employeeName: 'Marcus Thorne',
    employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJc1vHCH_qwShEpevCZ_7ePKL6vu6Ps4CI43PKSq1MNfUO_uDUKmH-Q9oxjwSfnb0pz9OdQbOabsTmrya-049X5BZLJU28Lp-zbhJ8J4veoD1vTvtMauf-EG5ac-JRuy21piLghrswf9IFD33FvrnA-Vwhro71OH2eIaB0-R9zHtIHdyS_7E52rworTHpBqPbxa2LEgnOV15s6DETcDGcM-GHMn410eL55KNE1vwrj8IAbtjhU85jodg',
    leaveType: 'paid',
    startDate: '2024-10-12',
    endDate: '2024-10-16',
    duration: '5 Days',
    status: 'pending',
    reason: 'Family trip',
    submittedOn: 'Oct 01, 2024',
    reviewedBy: 'Waiting...'
  },
  {
    id: 3,
    userId: 2, // Sarah Jenkins
    employeeId: 'EMP002',
    employeeName: 'Sarah Jenkins',
    employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUmad-dVuwzDgqEj-xknLKG3lZmQBS7zcsHxVnMEDCX21eMvFGc0vr0jLppvsGuHZpmajKPjCCnxLed-MGkwTkjY15XMhNf1jqH8IWI0ayddA3Hi2e7AsQ1JsyiQTWdraE96bY-ti4qUXFmwOrMPpEb8tXOG8a6PlBjd-q7LJLi4m2R4JITqjcFjZn2KJuJGVREKjkUwXpnVkUatahUL22QkWFs2AObF50ytRrVoigVN7xwg-ZrE9IlQ',
    leaveType: 'paid',
    startDate: '2024-10-20',
    endDate: '2024-10-25',
    duration: '6 Days',
    status: 'pending',
    reason: 'Personal affairs',
    submittedOn: 'Oct 15, 2024',
    reviewedBy: 'Waiting...'
  }
];

const INITIAL_ATTENDANCE = [
  {
    id: 1,
    userId: 2, // Sarah Jenkins
    employeeId: 'EMP002',
    date: '2024-10-23',
    checkIn: '09:05 AM',
    checkOut: '06:15 PM',
    status: 'present'
  }
];

// Helper to initialize local storage
const initLocalStorage = () => {
  if (!localStorage.getItem('peoplehub_db_employees')) {
    localStorage.setItem('peoplehub_db_employees', JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (!localStorage.getItem('peoplehub_db_leaves')) {
    localStorage.setItem('peoplehub_db_leaves', JSON.stringify(INITIAL_LEAVES));
  }
  if (!localStorage.getItem('peoplehub_db_attendance')) {
    localStorage.setItem('peoplehub_db_attendance', JSON.stringify(INITIAL_ATTENDANCE));
  }
};
initLocalStorage();

// Mock database CRUD methods
const db = {
  getEmployees: () => JSON.parse(localStorage.getItem('peoplehub_db_employees')),
  saveEmployees: (data) => localStorage.setItem('peoplehub_db_employees', JSON.stringify(data)),
  
  getLeaves: () => JSON.parse(localStorage.getItem('peoplehub_db_leaves')),
  saveLeaves: (data) => localStorage.setItem('peoplehub_db_leaves', JSON.stringify(data)),
  
  getAttendance: () => JSON.parse(localStorage.getItem('peoplehub_db_attendance')),
  saveAttendance: (data) => localStorage.setItem('peoplehub_db_attendance', JSON.stringify(data))
};

// --- API Service Wrapper with LocalStorage Fallback ---
const getHeaders = () => {
  const token = localStorage.getItem('peoplehub_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const mergedOptions = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  };

  try {
    const res = await fetch(url, mergedOptions);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'API request failed');
    }
    return await res.json();
  } catch (err) {
    console.warn(`API server down. Falling back to LocalStorage for route: ${path}`, err);
    return fallback(path, options);
  }
}

// Fallback logic representing the backend API schema
function fallback(path, options) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  const tokenUser = JSON.parse(localStorage.getItem('peoplehub_currentUser'));

  // Route matches:
  
  // 1. Auth routes
  if (path === '/auth/login' && method === 'POST') {
    const { email } = body;
    const emps = db.getEmployees();
    const user = emps.find(e => e.email === email) || emps[1]; // default to Sarah if not found
    localStorage.setItem('peoplehub_currentUser', JSON.stringify(user));
    localStorage.setItem('peoplehub_token', 'mock_jwt_token_value');
    return { token: 'mock_jwt_token_value', user };
  }
  
  if (path === '/auth/signup' && method === 'POST') {
    const { email, employeeId, name, role } = body;
    const emps = db.getEmployees();
    const newUser = {
      id: emps.length + 1,
      employeeId: employeeId || `EMP0${emps.length + 1}`,
      name: name || 'New Employee',
      role: role || 'employee',
      email,
      phone: '',
      address: '',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYNnRDJbzBJdyzFG8jkMRo_WotxnOHgHIiJf2GqXJAXSyo0yLrrS4EA1Tpj5P2B6R74goXYD4p5FVvxn03eKqmZfUQnSmFRX67-SwvqaZqSp2DKPfis36UZhNLH3K_hxXnP8KVfxhOP1illxOsXyVOREcgTJAkF8vwFOs3S7ZepECtRofsdgdOQiHS9DCH0nd8BtwbWR-WbgeIHl9ChNRNSldAPVutEsR2cw9rOPDvpM5EAwNMz_2NDg',
      salary: 6000,
      tags: [],
      status: 'Present',
      dateOfJoining: new Date().toISOString().split('T')[0]
    };
    emps.push(newUser);
    db.saveEmployees(emps);
    localStorage.setItem('peoplehub_currentUser', JSON.stringify(newUser));
    localStorage.setItem('peoplehub_token', 'mock_jwt_token_value');
    return { token: 'mock_jwt_token_value', user: newUser };
  }
  
  if (path === '/auth/me' && method === 'GET') {
    if (!tokenUser) throw new Error('Not authenticated');
    return tokenUser;
  }

  // 2. Profile routes
  if (path === '/profile/all' && method === 'GET') {
    return db.getEmployees();
  }
  
  if (path.startsWith('/profile/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const emps = db.getEmployees();
    const emp = emps.find(e => e.id === id);
    if (!emp) throw new Error('Profile not found');
    return emp;
  }
  
  if (path.startsWith('/profile/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const emps = db.getEmployees();
    const updatedEmps = emps.map(e => {
      if (e.id === id) {
        const merged = { ...e, ...body };
        if (tokenUser && tokenUser.id === id) {
          localStorage.setItem('peoplehub_currentUser', JSON.stringify(merged));
        }
        return merged;
      }
      return e;
    });
    db.saveEmployees(updatedEmps);
    return updatedEmps.find(e => e.id === id);
  }

  // 3. Attendance routes
  if (path === '/attendance/my' && method === 'GET') {
    const atts = db.getAttendance();
    return atts.filter(a => a.employeeId === tokenUser?.employeeId);
  }
  
  if (path === '/attendance/all' && method === 'GET') {
    return db.getAttendance();
  }
  
  if (path === '/attendance/check-in' && method === 'POST') {
    const atts = db.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newRecord = {
      id: Date.now(),
      userId: tokenUser?.id,
      employeeId: tokenUser?.employeeId,
      date: todayStr,
      checkIn: timeNow,
      checkOut: '',
      status: 'present'
    };
    
    atts.push(newRecord);
    db.saveAttendance(atts);
    
    // Update active status
    const emps = db.getEmployees().map(e => e.id === tokenUser.id ? { ...e, status: 'Present' } : e);
    db.saveEmployees(emps);
    
    return newRecord;
  }
  
  if (path === '/attendance/check-out' && method === 'POST') {
    const atts = db.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const recordIndex = atts.findIndex(a => a.employeeId === tokenUser?.employeeId && a.date === todayStr && !a.checkOut);
    if (recordIndex > -1) {
      atts[recordIndex].checkOut = timeNow;
      db.saveAttendance(atts);
    }
    
    // Update active status
    const emps = db.getEmployees().map(e => e.id === tokenUser.id ? { ...e, status: 'Out of Office' } : e);
    db.saveEmployees(emps);
    
    return recordIndex > -1 ? atts[recordIndex] : null;
  }

  // 4. Leave routes
  if (path === '/leave/my' && method === 'GET') {
    const leaves = db.getLeaves();
    return leaves.filter(l => l.employeeId === tokenUser?.employeeId);
  }
  
  if (path === '/leave/all' && method === 'GET') {
    return db.getLeaves();
  }
  
  if (path === '/leave/apply' && method === 'POST') {
    const leaves = db.getLeaves();
    const { leave_type, start_date, end_date, reason } = body;
    
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const durationStr = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    
    const newLeave = {
      id: Date.now(),
      userId: tokenUser?.id,
      employeeId: tokenUser?.employeeId,
      employeeName: tokenUser?.name,
      employeeAvatar: tokenUser?.avatar,
      leaveType: leave_type,
      startDate: start_date,
      endDate: end_date,
      duration: durationStr,
      status: 'pending',
      reason: reason || 'N/A',
      submittedOn: new Date().toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
      reviewedBy: 'Waiting...'
    };
    
    leaves.unshift(newLeave);
    db.saveLeaves(leaves);
    return newLeave;
  }
  
  if (path.startsWith('/leave/') && path.endsWith('/review') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const { status, admin_comment } = body;
    const leaves = db.getLeaves();
    
    const updatedLeaves = leaves.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: status.toLowerCase(),
          reviewedBy: tokenUser ? tokenUser.name : 'HR Manager',
          admin_comment
        };
      }
      return l;
    });
    db.saveLeaves(updatedLeaves);
    
    // If approved, update active status
    if (status.toLowerCase() === 'approved') {
      const targetLeave = leaves.find(l => l.id === id);
      if (targetLeave) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr >= targetLeave.startDate && todayStr <= targetLeave.endDate) {
          const emps = db.getEmployees().map(e => e.employeeId === targetLeave.employeeId ? { ...e, status: 'On Leave' } : e);
          db.saveEmployees(emps);
        }
      }
    }
    
    return { success: true };
  }

  // 5. Payroll routes
  if (path === '/payroll/my' && method === 'GET') {
    return {
      basic_salary: tokenUser?.salary || 8450,
      allowances: (tokenUser?.salary || 8450) * 0.12,
      deductions: (tokenUser?.salary || 8450) * 0.08,
      net_salary: (tokenUser?.salary || 8450) * 1.04
    };
  }
  
  if (path === '/payroll/all' && method === 'GET') {
    const emps = db.getEmployees();
    return emps.map(e => ({
      userId: e.id,
      employeeId: e.employeeId,
      name: e.name,
      basic_salary: e.salary,
      allowances: e.salary * 0.12,
      deductions: e.salary * 0.08,
      net_salary: e.salary * 1.04
    }));
  }
  
  if (path.startsWith('/payroll/') && method === 'PUT') {
    const userId = parseInt(path.split('/')[2]);
    const { basic_salary } = body;
    const emps = db.getEmployees();
    const updatedEmps = emps.map(e => e.id === userId ? { ...e, salary: basic_salary } : e);
    db.saveEmployees(updatedEmps);
    return { success: true };
  }

  throw new Error('Fallback route not matched');
}

export const apiService = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  
  getEmployees: () => request('/profile/all'),
  getProfile: (id) => request(`/profile/${id}`),
  updateProfile: (id, data) => request(`/profile/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  getMyAttendance: () => request('/attendance/my'),
  getAllAttendance: () => request('/attendance/all'),
  checkIn: () => request('/attendance/check-in', { method: 'POST' }),
  checkOut: () => request('/attendance/check-out', { method: 'POST' }),
  
  getMyLeaves: () => request('/leave/my'),
  getAllLeaves: () => request('/leave/all'),
  applyLeave: (leaveData) => request('/leave/apply', { method: 'POST', body: JSON.stringify(leaveData) }),
  reviewLeave: (id, reviewData) => request(`/leave/${id}/review`, { method: 'PUT', body: JSON.stringify(reviewData) }),
  
  getMyPayroll: () => request('/payroll/my'),
  getAllPayroll: () => request('/payroll/all'),
  updatePayroll: (userId, payrollData) => request(`/payroll/${userId}`, { method: 'PUT', body: JSON.stringify(payrollData) })
};
export default apiService;
