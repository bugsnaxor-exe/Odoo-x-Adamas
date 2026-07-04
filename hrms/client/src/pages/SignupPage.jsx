import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", role: "employee" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Instantly verified for this demo — no email step</p>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="role-toggle" role="tablist" aria-label="Account type">
          <button
            type="button"
            className={`role-toggle__option ${form.role === "employee" ? "role-toggle__option--active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, role: "employee" }))}
          >
            Employee
          </button>
          <button
            type="button"
            className={`role-toggle__option ${form.role === "admin" ? "role-toggle__option--active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, role: "admin" }))}
          >
            Admin
          </button>
        </div>

        <div className="field-row">
          <label className="field">
            <span className="field__label">First name</span>
            <input value={form.first_name} onChange={update("first_name")} required />
          </label>
          <label className="field">
            <span className="field__label">Last name</span>
            <input value={form.last_name} onChange={update("last_name")} required />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Email</span>
          <input type="email" value={form.email} onChange={update("email")} required placeholder="you@company.com" />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={6}
            placeholder="At least 6 characters"
          />
        </label>

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}