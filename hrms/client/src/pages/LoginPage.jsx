import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password, role);
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
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Sign in to your HRMS account</p>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="role-toggle" role="tablist" aria-label="Login as">
          <button
            type="button"
            className={`role-toggle__option ${role === "employee" ? "role-toggle__option--active" : ""}`}
            onClick={() => setRole("employee")}
          >
            Employee
          </button>
          <button
            type="button"
            className={`role-toggle__option ${role === "admin" ? "role-toggle__option--active" : ""}`}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <p className="auth-card__hint">
          Demo admin: admin@hrms.local / Admin@123<br />
          Demo employee: employee1@hrms.local / Employee@123
        </p>
      </form>
    </div>
  );
}