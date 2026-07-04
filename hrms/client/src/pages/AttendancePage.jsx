import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function AttendancePage() {
  const { isAdmin } = useAuth();
  const [myRecords, setMyRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const [today, setToday] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    loadMine();
    if (isAdmin) loadAll();
  }, []);

  function loadMine() {
    api
      .myAttendance()
      .then(({ attendance }) => {
        setMyRecords(attendance);
        setToday(attendance.find((a) => a.date === todayStr) || null);
      })
      .catch((e) => setError(e.message));
  }

  function loadAll() {
    api.allAttendance().then(({ attendance }) => setAllRecords(attendance)).catch((e) => setError(e.message));
  }

  async function handleCheckIn() {
    setBusy(true);
    setError("");
    try {
      await api.checkIn();
      loadMine();
      if (isAdmin) loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setBusy(true);
    setError("");
    try {
      await api.checkOut();
      loadMine();
      if (isAdmin) loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const records = viewAll ? allRecords : myRecords;

  return (
    <div>
      <h1 className="page-title">Attendance</h1>
      {error && <div className="alert alert--error">{error}</div>}

      <div className="panel">
        <div className="btn-row">
          <button className="btn btn--primary" onClick={handleCheckIn} disabled={busy || !!today?.check_in}>
            Check In
          </button>
          <button
            className="btn btn--secondary"
            onClick={handleCheckOut}
            disabled={busy || !today?.check_in || !!today?.check_out}
          >
            Check Out
          </button>
          {isAdmin && (
            <button className="btn btn--ghost" onClick={() => setViewAll((v) => !v)}>
              {viewAll ? "Show my attendance" : "Show all employees"}
            </button>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel__title">{viewAll ? "All Employees" : "My History"}</h2>
        <table className="table">
          <thead>
            <tr>
              {viewAll && <th>Employee</th>}
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((a) => (
              <tr key={a.id}>
                {viewAll && <td>{a.first_name} {a.last_name} ({a.employee_id})</td>}
                <td>{a.date}</td>
                <td>{a.check_in ? new Date(a.check_in).toLocaleTimeString() : "—"}</td>
                <td>{a.check_out ? new Date(a.check_out).toLocaleTimeString() : "—"}</td>
                <td><span className={`status status--${a.status}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="muted">No records found.</p>}
      </div>
    </div>
  );
}
