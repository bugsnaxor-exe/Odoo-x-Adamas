// client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      // AuthContext handles setting user state, now navigate:
      // Check localStorage for the role we just logged in with
      const savedUser = JSON.parse(localStorage.getItem('peoplehub_currentUser'));
      navigate(savedUser?.role === 'admin' ? '/dashboard' : '/attendance');
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setLoading(true);
    const result = await login(roleEmail, 'password');
    setLoading(false);
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('peoplehub_currentUser'));
      navigate(savedUser?.role === 'admin' ? '/dashboard' : '/attendance');
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
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-4xl text-primary font-bold tracking-tight">PeopleHub</h1>
          <p className="text-on-surface-variant font-body-md mt-2">Every workday, perfectly aligned.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/20 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-body-md">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter admin@peoplehub.com or sarah@peoplehub.com"
                className="w-full bg-white/20 hover:bg-white/40 focus:bg-white/50 border border-white/30 focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-body-md placeholder-outline outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/20 hover:bg-white/40 focus:bg-white/50 border border-white/30 focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-body-md placeholder-outline outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full ios-gradient-primary text-white py-3.5 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <span className="material-symbols-outlined text-[18px]">login</span>
          </button>
        </form>

        <p className="text-center text-label-sm text-on-surface-variant mt-4">
          Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
        </p>

        {/* Separator */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <span className="relative bg-[#f9f9ff] px-4 text-label-sm text-on-surface-variant opacity-60">
            DEMO LOGIN SHORTCUTS
          </span>
        </div>

        {/* Quick Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleQuickLogin('elena.rodriguez@peoplehub.com')}
            className="flex flex-col items-center p-4 bg-white/30 border border-white/20 rounded-2xl hover:bg-white/50 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mb-2 group-hover:scale-105 transition-all">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJEPQOhs6hx6nWexvdHp2DyhpUIyi6F_JsG89EOgp9TF6OajZiSN_MsXrv-9uTZNdXhWAbI7WL4eC5Jnyo4Wj0-7yOrVmTU5PptDjIh1siUhvnlJJrmyX1aFQEBtolLqMC7si5sFYgTAIccx9CuT-IEJgbOt-6iDBVWoIGQyl88NfFb3Q-6FDrS6iOMzl6ZV2Mfqcn7sl7lIgl_wAFkJmWRLrHITQJvr7YHTy45EpJCNwL7wgczDnmDA" alt="Elena" />
            </div>
            <span className="text-label-sm font-bold text-primary">Elena (HR Admin)</span>
          </button>

          <button
            onClick={() => handleQuickLogin('sarah.jenkins@peoplehub.com')}
            className="flex flex-col items-center p-4 bg-white/30 border border-white/20 rounded-2xl hover:bg-white/50 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mb-2 group-hover:scale-105 transition-all">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUmad-dVuwzDgqEj-xknLKG3lZmQBS7zcsHxVnMEDCX21eMvFGc0vr0jLppvsGuHZpmajKPjCCnxLed-MGkwTkjY15XMhNf1jqH8IWI0ayddA3Hi2e7AsQ1JsyiQTWdraE96bY-ti4qUXFmwOrMPpEb8tXOG8a6PlBjd-q7LJLi4m2R4JITqjcFjZn2KJuJGVREKjkUwXpnVkUatahUL22QkWFs2AObF50ytRrVoigVN7xwg-ZrE9IlQ" alt="Sarah" />
            </div>
            <span className="text-label-sm font-bold text-primary">Sarah (Employee)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
