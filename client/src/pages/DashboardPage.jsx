// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
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

  // Welcome name default to Elena if not loaded
  const firstName = user?.name ? user.name.split(' ')[0] : 'Elena';

  return (
    <div className="space-y-6 fade-in-up">
      {/* Welcome Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Morning, {firstName}</h1>
        <p className="text-[14px] text-on-surface-variant/80 mt-0.5">Your organization is thriving today. Here's your snapshot.</p>
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

        {/* Quick Action: New Hire (4 Col) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-700"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-4">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                person_add
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary-container">New Hire</h3>
            <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">
              Launch the onboarding workflow for a new teammate.
            </p>
          </div>
          <button className="mt-8 w-full bg-primary text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/10">
            Start Onboarding
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

        {/* Payroll Summary (8 Col) - Formatted to INR Rupees */}
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
