// ============================================
// HRMS Backend — Main Server Entry Point
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize database (runs schema on first load)
require('./db/database.js');

const app = express();

// ---------------------
// Middleware
// ---------------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (profile pictures, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------
// API Routes
// ---------------------
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const payrollRoutes = require('./routes/payroll');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

// ---------------------
// Health Check
// ---------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ---------------------
// Global Error Handler
// ---------------------
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 HRMS Server running on http://localhost:${PORT}`);
  console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Profile endpoints: http://localhost:${PORT}/api/profile`);
  console.log(`📅 Attendance endpoints: http://localhost:${PORT}/api/attendance`);
  console.log(`🏖️  Leave endpoints: http://localhost:${PORT}/api/leave`);
  console.log(`💰 Payroll endpoints: http://localhost:${PORT}/api/payroll\n`);
});

module.exports = app;
