// client/src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const result = await signup({ email, password, name, employeeId, role });
    setLoading(false);
    
    if (result.success) {
      navigate(role === 'admin' ? '/dashboard' : '/attendance');
    } else {
      setError(result.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-background text-on-background font-body-md">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-start blur-[120px] opacity-25"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-end blur-[150px] opacity-25"></div>
      </div>

      <div className="w-full max-w-md glass p-8 rounded-lg border border-white/30 shadow-2xl relative fade-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-display-lg text-4xl text-primary font-bold tracking-tight">Create Account</h1>
          <p className="text-on-surface-variant font-body-md mt-2">Join the PeopleHub portal today.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/20 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-body-md">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-white/20 hover:bg-white/40 focus:bg-white/50 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md placeholder-outline outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john.doe@peoplehub.com"
              className="w-full bg-white/20 hover:bg-white/40 focus:bg-white/50 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md placeholder-outline outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">Employee ID (Optional)</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP012"
              className="w-full bg-white/20 hover:bg-white/40 focus:bg-white/50 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md placeholder-outline outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/20 hover:bg-white/40 focus:bg-white/50 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md placeholder-outline outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 px-4 text-body-md outline-none cursor-pointer focus:border-primary transition-all"
            >
              <option value="employee">Regular Employee</option>
              <option value="admin">HR / Admin Manager</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full ios-gradient-primary text-white py-3.5 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-4"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <span className="material-symbols-outlined text-[18px]">person_add</span>
          </button>
        </form>

        <p className="text-center text-label-sm text-on-surface-variant mt-4">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
