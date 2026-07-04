// client/src/pages/PayrollPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function PayrollPage() {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState(null);
  const [allPayroll, setAllPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayrollData = async () => {
    try {
      const myPayroll = await apiService.getMyPayroll();
      setPayroll(myPayroll);
      
      if (user?.role === 'admin') {
        const list = await apiService.getAllPayroll();
        setAllPayroll(list);
      }
    } catch (err) {
      console.error('Failed to fetch payroll data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [user]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  const basicSalary = payroll?.basic_salary || 8450;
  const allowances = payroll?.allowances || 1014;
  const deductions = payroll?.deductions || 676;
  const netSalary = basicSalary + allowances - deductions;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-primary font-bold">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  return (
    <main className="space-y-6 fade-in-up">
      {/* Header Title with Subtitle & Download Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Payroll Portal</h1>
          <p className="text-[14px] text-on-surface-variant/80 mt-0.5">Manage your earnings, taxes, and financial history.</p>
        </div>
        <button className="ios-gradient-primary text-white py-2.5 px-6 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/10">
          Download Last Payslip
          <span className="material-symbols-outlined text-[16px]">download</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8-col on desktop): Next Pay Cycle & Salary Breakdown */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Next Pay Cycle Card */}
          <div className="glass p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] text-outline font-bold uppercase tracking-widest opacity-60">
                  Next Pay Cycle
                </span>
                <h3 className="text-xl md:text-2xl text-on-background font-bold mt-0.5">
                  September 30, 2024
                </h3>
              </div>
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </span>
            </div>

            <div className="mb-6 flex items-baseline">
              <span className="text-4xl md:text-5xl text-primary font-black tracking-tight">
                {formatCurrency(netSalary)}
              </span>
              <span className="text-xs text-on-surface-variant font-semibold ml-2.5 opacity-80">
                Estimated Net
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-on-surface-variant mb-1.5 font-bold opacity-80">
                <span>Cycle Progress</span>
                <span>22 of 30 Days</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-2 relative">
                <div className="w-[73%] ios-gradient-primary h-2 rounded-full shadow-[0_0_8px_#0058bc]"></div>
              </div>
              <div className="flex justify-between text-[11px] text-outline mt-1.5 font-bold opacity-60">
                <span>Started Sep 01</span>
                <span>Next: Oct 31</span>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Card */}
          <div className="glass p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-background">Salary Breakdown</h3>
              <div className="flex gap-2">
                <button className="bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-bold transition-all">
                  Monthly
                </button>
                <button className="text-on-surface-variant/80 px-3.5 py-1 rounded-full text-xs font-bold hover:bg-black/5 transition-all">
                  Quarterly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6 h-52 items-end text-center mb-6">
              {[
                { label: 'May', height: 'h-[60%]', color: 'from-[#0058bc] to-[#00418f]' },
                { label: 'Jun', height: 'h-[70%]', color: 'from-[#0058bc] to-[#8d2ebc]' },
                { label: 'Jul', height: 'h-[75%]', color: 'from-[#8d2ebc] to-[#d072ff]' },
                { label: 'Aug', height: 'h-[85%]', color: 'from-[#0058bc] to-[#00418f]' },
                { label: 'Sep', height: 'h-[92%]', color: 'from-[#0058bc] to-[#8d2ebc]' }
              ].map((month, idx) => (
                <div key={idx} className="flex flex-col items-center h-full justify-between">
                  <div className="w-8 md:w-12 bg-black/5 rounded-full h-[85%] relative flex items-end justify-center">
                    <div className={`w-full ${month.height} bg-gradient-to-t ${month.color} rounded-full`}></div>
                  </div>
                  <span className="text-[12px] text-on-surface-variant font-medium mt-1">{month.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-label-sm font-semibold opacity-85">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Base Salary</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Bonus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#c3d4ff]"></span> Allowances</span>
            </div>
          </div>

          {/* Org Payroll (For Admin only) */}
          {user?.role === 'admin' && (
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-on-background mb-4">Organization Payroll List</h3>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-[11px] font-bold text-outline uppercase tracking-wider">
                      <th className="py-3">Employee</th>
                      <th className="py-3">Base Salary</th>
                      <th className="py-3">Allowances</th>
                      <th className="py-3">Deductions</th>
                      <th className="py-3 text-primary">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm font-semibold text-on-surface-variant">
                    {allPayroll.map((p) => (
                      <tr key={p.userId} className="hover:bg-white/30 transition-colors">
                        <td className="py-3 text-on-background">{p.name} <span className="block text-[10px] text-outline font-medium">{p.employeeId}</span></td>
                        <td className="py-3">{formatCurrency(p.basic_salary)}</td>
                        <td className="py-3">{formatCurrency(p.allowances)}</td>
                        <td className="py-3 text-error">{formatCurrency(p.deductions)}</td>
                        <td className="py-3 font-bold text-primary">{formatCurrency(p.net_salary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>

        {/* RIGHT COLUMN (4-col on desktop): YTD, Tax, Recent Payslips */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* YTD Earnings Card */}
          <div className="glass p-6 rounded-3xl flex flex-col justify-between">
            <span className="text-[10px] text-outline font-bold uppercase tracking-widest opacity-60">
              YTD Earnings
            </span>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-black text-on-background tracking-tight">
                {formatCurrency(76200)}
              </h3>
              <span className="bg-red-50 text-red-500 border border-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                +12% vs LY
              </span>
            </div>
          </div>

          {/* Tax Deductions Card */}
          <div className="glass p-6 rounded-3xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest opacity-60">
                Tax Deductions
              </span>
              <h3 className="text-2xl font-black text-on-background tracking-tight mt-1">
                {formatCurrency(18450)}
              </h3>
            </div>
            <span className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </span>
          </div>

          {/* Recent Payslips Card */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-on-background">Recent Payslips</h3>
            <div className="space-y-3">
              {[
                { month: 'August 2024', amount: 8450, date: 'Paid on Aug 30' },
                { month: 'July 2024', amount: 8450, date: 'Paid on Jul 31' },
                { month: 'June 2024', amount: 8200, date: 'Paid on Jun 30' }
              ].map((slip, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-white/20 hover:bg-white/60 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-background">{slip.month}</div>
                      <div className="text-[10px] text-outline font-medium">{slip.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-on-surface-variant">{formatCurrency(slip.amount)}</span>
                    <button className="p-1.5 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2.5 border border-primary/20 hover:bg-primary/5 rounded-2xl text-xs font-bold text-primary transition-all">
              View All Payslips
            </button>
          </div>

        </section>

      </div>

      {/* Bottom Update financial card */}
      <div className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h3 className="text-lg font-bold text-on-background">Update Your Financial Details</h3>
          <p className="text-[13px] text-on-surface-variant/80 mt-1">
            Need to change your bank account or adjust tax withholdings? You can update your payment preferences anytime before the 25th of each month.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="px-5 py-2.5 bg-primary/10 hover:bg-primary/25 border border-primary/10 text-primary text-xs font-bold rounded-full transition-all active:scale-95">
            Update Bank Account
          </button>
          <button className="px-5 py-2.5 ios-gradient-primary hover:brightness-110 text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-md shadow-primary/10">
            Tax Settings
          </button>
        </div>
      </div>
    </main>
  );
}
