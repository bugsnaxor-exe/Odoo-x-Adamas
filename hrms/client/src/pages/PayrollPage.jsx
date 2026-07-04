import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function PayrollPage() {
  const { isAdmin } = useAuth();
  const [myPayroll, setMyPayroll] = useState([]);
  const [allPayroll, setAllPayroll] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ month: "", basic_salary: "", allowances: "", deductions: "" });

  useEffect(() => {
    if (isAdmin) loadAll();
    else loadMine();
  }, [isAdmin]);

  function loadMine() {
    api.myPayroll().then(({ payroll }) => setMyPayroll(payroll)).catch((e) => setError(e.message));
  }

  function loadAll() {
    api.allPayroll().then(({ payroll }) => setAllPayroll(payroll)).catch((e) => setError(e.message));
  }

  function startEdit(row) {
    setEditRow(row.user_id + "-" + row.month);
    setForm({
      month: row.month,
      basic_salary: row.basic_salary,
      allowances: row.allowances,
      deductions: row.deductions,
      userId: row.user_id,
    });
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.updatePayroll(form.userId, {
        month: form.month,
        basic_salary: Number(form.basic_salary),
        allowances: Number(form.allowances),
        deductions: Number(form.deductions),
      });
      setSuccess("Payroll updated.");
      setEditRow(null);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (isAdmin) {
    return (
      <div>
        <h1 className="page-title">Payroll</h1>
        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allPayroll.map((p) => {
                const rowKey = p.user_id + "-" + p.month;
                const isEditing = editRow === rowKey;
                return isEditing ? (
                  <tr key={rowKey}>
                    <td colSpan={7}>
                      <form className="inline-form" onSubmit={handleSave}>
                        <input type="text" value={form.month} onChange={update("month")} placeholder="YYYY-MM" />
                        <input type="number" value={form.basic_salary} onChange={update("basic_salary")} placeholder="Basic" />
                        <input type="number" value={form.allowances} onChange={update("allowances")} placeholder="Allowances" />
                        <input type="number" value={form.deductions} onChange={update("deductions")} placeholder="Deductions" />
                        <button className="btn btn--primary btn--sm" type="submit">Save</button>
                        <button className="btn btn--ghost btn--sm" type="button" onClick={() => setEditRow(null)}>Cancel</button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={rowKey}>
                    <td>{p.first_name} {p.last_name} ({p.employee_id})</td>
                    <td>{p.month}</td>
                    <td>{p.basic_salary.toFixed(2)}</td>
                    <td>{p.allowances.toFixed(2)}</td>
                    <td>{p.deductions.toFixed(2)}</td>
                    <td><strong>{p.net_salary.toFixed(2)}</strong></td>
                    <td><button className="btn btn--ghost btn--sm" onClick={() => startEdit(p)}>Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {allPayroll.length === 0 && <p className="muted">No payroll records yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Payroll</h1>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {myPayroll.map((p) => (
              <tr key={p.id}>
                <td>{p.month}</td>
                <td>{p.basic_salary.toFixed(2)}</td>
                <td>{p.allowances.toFixed(2)}</td>
                <td>{p.deductions.toFixed(2)}</td>
                <td><strong>{p.net_salary.toFixed(2)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
        {myPayroll.length === 0 && <p className="muted">No payroll records yet.</p>}
      </div>
    </div>
  );
}
