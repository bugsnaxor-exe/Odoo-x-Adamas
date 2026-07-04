import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function LeavePage() {
  const { isAdmin } = useAuth();
  const [myLeave, setMyLeave] = useState([]);
  const [allLeave, setAllLeave] = useState([]);
  const [form, setForm] = useState({ leave_type: "paid", start_date: "", end_date: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [comments, setComments] = useState({});

  useEffect(() => {
    if (isAdmin) loadAll();
    else loadMine();
  }, [isAdmin]);

  function loadMine() {
    api.myLeave().then(({ leave }) => setMyLeave(leave)).catch((e) => setError(e.message));
  }

  function loadAll() {
    api.allLeave().then(({ leave }) => setAllLeave(leave)).catch((e) => setError(e.message));
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleApply(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.applyLeave(form);
      setForm({ leave_type: "paid", start_date: "", end_date: "", reason: "" });
      setSuccess("Leave request submitted.");
      loadMine();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReview(id, status) {
    setError("");
    try {
      await api.reviewLeave(id, { status, admin_comment: comments[id] || "" });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (isAdmin) {
    return (
      <div>
        <h1 className="page-title">Leave Requests</h1>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Comment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allLeave.map((l) => (
                <tr key={l.id}>
                  <td>{l.first_name} {l.last_name} ({l.employee_id})</td>
                  <td><span className="badge">{l.leave_type}</span></td>
                  <td>{l.start_date} → {l.end_date}</td>
                  <td>{l.reason || "—"}</td>
                  <td><span className={`status status--${l.status}`}>{l.status}</span></td>
                  <td>
                    {l.status === "pending" ? (
                      <input
                        placeholder="Optional comment"
                        value={comments[l.id] || ""}
                        onChange={(e) => setComments((c) => ({ ...c, [l.id]: e.target.value }))}
                      />
                    ) : (
                      l.admin_comment || "—"
                    )}
                  </td>
                  <td>
                    {l.status === "pending" && (
                      <div className="btn-row">
                        <button className="btn btn--primary btn--sm" onClick={() => handleReview(l.id, "approved")}>Approve</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleReview(l.id, "rejected")}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allLeave.length === 0 && <p className="muted">No leave requests yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Leave</h1>
      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <form className="panel" onSubmit={handleApply}>
        <h2 className="panel__title">Apply for Leave</h2>
        <label className="field">
          <span className="field__label">Leave type</span>
          <select value={form.leave_type} onChange={update("leave_type")}>
            <option value="paid">Paid</option>
            <option value="sick">Sick</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field__label">Start date</span>
            <input type="date" value={form.start_date} onChange={update("start_date")} required />
          </label>
          <label className="field">
            <span className="field__label">End date</span>
            <input type="date" value={form.end_date} onChange={update("end_date")} required />
          </label>
        </div>
        <label className="field">
          <span className="field__label">Reason</span>
          <textarea value={form.reason} onChange={update("reason")} rows={3} />
        </label>
        <button className="btn btn--primary" type="submit">Submit Request</button>
      </form>

      <div className="panel">
        <h2 className="panel__title">My Leave Requests</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Admin Comment</th>
            </tr>
          </thead>
          <tbody>
            {myLeave.map((l) => (
              <tr key={l.id}>
                <td><span className="badge">{l.leave_type}</span></td>
                <td>{l.start_date} → {l.end_date}</td>
                <td>{l.reason || "—"}</td>
                <td><span className={`status status--${l.status}`}>{l.status}</span></td>
                <td>{l.admin_comment || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {myLeave.length === 0 && <p className="muted">No leave requests yet.</p>}
      </div>
    </div>
  );
}
