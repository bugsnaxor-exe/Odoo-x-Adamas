// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [previewUser, setPreviewUser] = useState(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emps = await apiService.getEmployees();
        setEmployees(emps);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-primary font-bold">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Elena';

  // --- 1. EMPLOYEE DASHBOARD PORTAL (3.2.1) ---
  if (!isAdmin) {
    return (
      <div className="space-y-6 fade-in-up">
        {/* Welcome Header */}
        <header className="mb-4">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Morning, {firstName}</h1>
          <p className="text-[14px] text-on-surface-variant/80 mt-0.5">Welcome to your PeopleHub portal dashboard.</p>
        </header>

        {/* 4 Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="glass p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[22px]">person</span>
              </div>
              <h3 className="font-bold text-lg text-on-background">My Profile</h3>
              <p className="text-xs text-on-surface-variant mt-2 truncate font-semibold">
                {user?.jobTitle} • {user?.department}
              </p>
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className="mt-6 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-xs font-bold transition-all"
            >
              View Settings
            </button>
          </div>

          {/* Attendance Card */}
          <div className="glass p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-secondary-container/15 flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[22px]">fingerprint</span>
              </div>
              <h3 className="font-bold text-lg text-on-background">My Attendance</h3>
              <p className="text-xs text-on-surface-variant mt-2 font-semibold">
                Daily Check-In & Calendar logs
              </p>
            </div>
            <button 
              onClick={() => navigate('/attendance')}
              className="mt-6 w-full py-2 bg-secondary-container/15 hover:bg-secondary-container/25 text-secondary rounded-2xl text-xs font-bold transition-all"
            >
              Go to Tracker
            </button>
          </div>

          {/* Leave Card */}
          <div className="glass p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[22px]">beach_access</span>
              </div>
              <h3 className="font-bold text-lg text-on-background">Leave Requests</h3>
              <p className="text-xs text-on-surface-variant mt-2 font-semibold">
                14 Days Annual Leave Balance
              </p>
            </div>
            <button 
              onClick={() => navigate('/leave')}
              className="mt-6 w-full py-2 bg-primary-container/15 hover:bg-primary-container/25 text-primary rounded-2xl text-xs font-bold transition-all"
            >
              Request Leave
            </button>
          </div>

          {/* Logout Card */}
          <div className="glass p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-red-100/60 flex items-center justify-center text-red-500 mb-4">
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </div>
              <h3 className="font-bold text-lg text-on-background">Secure Logout</h3>
              <p className="text-xs text-on-surface-variant mt-2 font-semibold">
                Safely end your session
              </p>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="mt-6 w-full py-2 bg-red-100/60 hover:bg-red-200/60 text-red-500 rounded-2xl text-xs font-bold transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Activity & Alerts Feed */}
        <div className="glass p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-on-background mb-4">Recent Activity & Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/40 border border-white/20 hover:bg-white/60 transition-all">
              <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
              <div>
                <p className="text-xs font-bold text-on-background">System Alert: September payroll cycle ends in 6 days.</p>
                <p className="text-[10px] text-outline mt-0.5">Please review your financial details before Sep 25.</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/40 border border-white/20 hover:bg-white/60 transition-all">
              <span className="material-symbols-outlined text-green-500 text-[20px]">verified</span>
              <div>
                <p className="text-xs font-bold text-on-background">Leave Approved: Sick Leave for Oct 05 approved by Elena Rodriguez.</p>
                <p className="text-[10px] text-outline mt-0.5">Approved on Oct 05, 2024.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // --- 2. ADMIN DASHBOARD WITH SWITCHER PREVIEW (3.2.2) ---
  const activeUser = previewUser || user;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Welcome Header with Employee Switcher */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            Morning, {firstName}
          </h1>
          <p className="text-[14px] text-on-surface-variant/80 mt-0.5">
            {previewUser 
              ? `Previewing portal details for employee: ${previewUser.name}` 
              : "Your organization is thriving today. Here's your snapshot."}
          </p>
        </div>

        {/* Custom Employee Switcher Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-2 border border-white/30 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 shadow-sm text-xs font-bold text-primary hover:bg-white/30 transition-all outline-none"
          >
            <span className="text-[10px] text-outline uppercase tracking-wider font-bold">Switch Employee:</span>
            <span>{previewUser ? previewUser.name : 'Admin (Elena)'}</span>
            <span 
              className="material-symbols-outlined text-[16px] transition-transform duration-300 select-none" 
              style={{ transform: switcherOpen ? 'rotate(180deg)' : 'none' }}
            >
              keyboard_arrow_down
            </span>
          </button>

          {switcherOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-lg border border-white/30 p-2 z-50 animate-fade-in-up max-h-60 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => {
                    setPreviewUser(null);
                    setSwitcherOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-xl transition-all text-xs font-bold text-on-background flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">admin_panel_settings</span>
                  Admin (Elena)
                </button>
                {employees
                  .filter(emp => emp.role !== 'admin')
                  .map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setPreviewUser(emp);
                        setSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-xl transition-all text-xs font-bold text-on-background flex items-center gap-2 mt-1"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-white flex-shrink-0">
                        <img className="w-full h-full object-cover" src={emp.avatar} alt={emp.name} />
                      </div>
                      <span className="truncate">{emp.name}</span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Workforce Metric (8 Col) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xs text-outline font-bold uppercase tracking-wider">Total Workforce</h3>
              <p className="text-4xl font-black text-primary mt-1">2,842</p>
              <div className="flex items-center gap-1 text-red-500 mt-1 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+12% from last month</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-bold transition-all">
                7 Days
              </button>
              <button className="text-on-surface-variant/80 px-3.5 py-1 rounded-full text-xs font-bold hover:bg-black/5 transition-all">
                30 Days
              </button>
            </div>
          </div>
          
          {/* Line Chart Visualization */}
          <div className="h-48 w-full mt-4 relative">
            <div className="absolute inset-0 flex items-end gap-1 px-2">
              <div className="flex-1 bg-primary/20 rounded-t-sm h-[40%]"></div>
              <div className="flex-1 bg-primary/20 rounded-t-sm h-[45%]"></div>
              <div className="flex-1 bg-primary/20 rounded-t-sm h-[35%]"></div>
              <div className="flex-1 bg-primary/30 rounded-t-sm h-[55%]"></div>
              <div className="flex-1 bg-primary/40 rounded-t-sm h-[70%]"></div>
              <div className="flex-1 bg-primary/50 rounded-t-sm h-[65%]"></div>
              <div className="flex-1 bg-primary/60 rounded-t-sm h-[85%]"></div>
              <div className="flex-1 bg-primary-container rounded-t-sm h-[95%] shadow-[0_0_20px_rgba(0,88,188,0.2)]"></div>
              <div className="flex-1 bg-primary/70 rounded-t-sm h-[80%]"></div>
              <div className="flex-1 bg-primary/60 rounded-t-sm h-[75%]"></div>
              <div className="flex-1 bg-primary/50 rounded-t-sm h-[90%]"></div>
              <div className="flex-1 bg-primary/40 rounded-t-sm h-[100%]"></div>
            </div>
          </div>
        </div>

        {/* Quick Action: New Hire / Switcher Details Card (4 Col) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-700"></div>
          {previewUser ? (
            <div>
              <div className="w-12 h-12 rounded-2xl overflow-hidden mb-4 border-2 border-white">
                <img className="w-full h-full object-cover" src={previewUser.avatar} alt={previewUser.name} />
              </div>
              <h3 className="text-xl font-bold text-primary-container">{previewUser.name}</h3>
              <p className="text-xs text-outline uppercase font-bold mt-1">{previewUser.jobTitle}</p>
              <div className="mt-4 space-y-2 text-xs font-semibold text-on-surface-variant">
                <div>Department: {previewUser.department}</div>
                <div>Status: {previewUser.status}</div>
                <div>Base Salary: ₹{previewUser.salary.toLocaleString('en-IN')}/mo</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person_add
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary-container">New Hire</h3>
              <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">
                Launch the onboarding workflow for a new teammate.
              </p>
            </div>
          )}
          
          <button className="mt-8 w-full bg-primary text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/10">
            {previewUser ? 'Manage Employee Profile' : 'Start Onboarding'}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Activity Feed (4 Col) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-background mb-5">Activity Feed</h3>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-tertiary-container/10 flex-shrink-0 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Sarah J. approved leave</p>
                  <p className="text-[10px] text-outline mt-0.5">2 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-secondary-container/10 flex-shrink-0 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Payroll batch processed</p>
                  <p className="text-[10px] text-outline mt-0.5">45 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-primary-container/10 flex-shrink-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">person_check</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">James Wilson joined</p>
                  <p className="text-[10px] text-outline mt-0.5">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 border border-outline-variant hover:bg-black/5 text-on-surface-variant font-bold text-xs rounded-2xl transition-all">
            View All Activity
          </button>
        </div>

        {/* Payroll Summary (8 Col) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-on-background">Payroll Summary</h3>
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              Cycle: Oct 1 - Oct 31
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                <span>Salaries Paid</span>
                <span className="text-on-surface">85%</span>
              </div>
              <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[11px] text-outline font-medium">₹1.2M of ₹1.4M disbursed</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                <span>Tax Compliance</span>
                <span className="text-on-surface">100%</span>
              </div>
              <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d072ff] to-[#8d2ebc] rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[11px] text-outline font-medium">All filings complete</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-black/5 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[120px]">
              <p className="text-[11px] text-outline font-bold uppercase tracking-wider">Pending Claims</p>
              <p className="text-2xl font-black text-primary mt-1">24</p>
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-[11px] text-outline font-bold uppercase tracking-wider">Tax Deductions</p>
              <p className="text-2xl font-black text-primary mt-1">₹42.8k</p>
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-[11px] text-outline font-bold uppercase tracking-wider">Net Payout</p>
              <p className="text-2xl font-black text-primary mt-1">₹1.08M</p>
            </div>
          </div>
        </div>

        {/* View Tasks (4 Col) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
            <h3 className="text-xl font-bold text-primary-container">View Tasks</h3>
            <p className="text-[13px] text-on-surface-variant mt-2">You have 8 pending approvals requiring attention.</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/5 transition-all cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-xs font-bold text-on-surface">Urgent: Payroll Audit</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/5 transition-all cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                <span className="text-xs font-bold text-on-surface">Review 4 Job Offers</span>
              </div>
            </div>
          </div>
          
          <button className="mt-6 w-full py-2.5 border border-primary hover:bg-primary/5 text-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
            Go to Task Center
          </button>
        </div>

      </div>
    </div>
  );
}
