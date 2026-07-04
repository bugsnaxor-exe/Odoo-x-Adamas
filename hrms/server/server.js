require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const attendanceRoutes = require("./routes/attendance");
const leaveRoutes = require("./routes/leave");
const payrollRoutes = require("./routes/payroll");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("HRMS API running."));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HRMS server running on port ${PORT}`));
