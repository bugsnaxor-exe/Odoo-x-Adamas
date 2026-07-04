import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (isAdmin) {
          const [{ attendance }, { leave }, { profiles }] = await Promise.all([
            api.dailyAttendance(new Date().toISOString().slice(0, 10)),
            api.allLeave("pending"),
            api.getAllProfiles(),
          ]);
          setAttendance(attendance);
          setLeaves(leave);
          setProfiles(profiles);

          const own = profiles.find((p) => p.user_id === user.id);
          if (own) setDisplayName(`${own.first_name} ${own.last_name}`.trim());
        } else {
          const [{ attendance }, { leave }, { profile }] = await Promise.all([
            api.myAttendance(),
            api.myLeave(),
            api.getProfile(user.id),
          ]);
          setAttendance(attendance);
          setLeaves(leave);
          setDisplayName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim());
        }
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [isAdmin, user.id]);

  return (
    <div>
      <h1 className="page-title">Welcome back{displayName ? `, ${displayName}` : user?.email ? `, ${user.email}` : ""}</h1>
      {error && <div className="alert alert--error">{error}</div>}

      {isAdmin ? (
        <>
          <div className="card-grid">
            <div className="stat-card">
              <div className="stat-card__value">{profiles.length}</div>
              <div className="stat-card__label">Total Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{attendance.filter((a) => a.status === "present").length}</div>
              <div className="stat-card__label">Present Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{leaves.length}</div>
              <div className="stat-card__label">Pending Leave Requests</div>
            </div>
          </div>

          <div className="panel">
            <h2 className="panel__title">Pending Leave Requests</h2>
            {leaves.length === 0 ? (
              <p className="muted">No pending requests.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.first_name} {l.last_name} ({l.employee_id})</td>
                      <td><span className="badge">{l.leave_type}</span></td>
                      <td>{l.start_date} → {l.end_date}</td>
                      <td>{l.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Link className="btn btn--primary" to="/leave">Review requests</Link>
          </div>
        </>
      ) : (
        <>
          <div className="card-grid">
            <Link className="quick-card" to="/profile">
              <span className="quick-card__icon">👤</span>
              <span>Profile</span>
            </Link>
            <Link className="quick-card" to="/attendance">
              <span className="quick-card__icon">🕒</span>
              <span>Attendance</span>
            </Link>
            <Link className="quick-card" to="/leave">
              <span className="quick-card__icon">📅</span>
              <span>Leave</span>
            </Link>
            <Link className="quick-card" to="/payroll">
              <span className="quick-card__icon">💰</span>
              <span>Payroll</span>
            </Link>
          </div>

          <div className="panel">
            <h2 className="panel__title">Recent Activity</h2>
            {attendance.length === 0 ? (
              <p className="muted">No attendance recorded yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 5).map((a) => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.check_in ? new Date(a.check_in).toLocaleTimeString() : "—"}</td>
                      <td>{a.check_out ? new Date(a.check_out).toLocaleTimeString() : "—"}</td>
                      <td><span className={`status status--${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}