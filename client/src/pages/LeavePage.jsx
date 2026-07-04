// client/src/pages/LeavePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function LeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState('paid');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const myLeaves = await apiService.getMyLeaves();
      const allLeaves = user?.role === 'admin' ? await apiService.getAllLeaves() : myLeaves;
      setLeaves(allLeaves);
    } catch (err) {
      console.error('Failed to load leaves history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setMessage('Please select both start and end dates.');
      return;
    }
    try {
      await apiService.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason || description
      });
      setMessage('Leave request submitted successfully!');
      setReason('');
      setStartDate('');
      setEndDate('');
      setDescription('');
      fetchLeaves();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Submission error: ' + err.message);
    }
  };

  const handleReviewLeave = async (id, status) => {
    try {
      await apiService.reviewLeave(id, { status, admin_comment: 'Reviewed by HR Manager' });
      fetchLeaves();
    } catch (err) {
      alert('Review error: ' + err.message);
    }
  };

  const myHistory = leaves.filter(l => l.employeeId === user?.employeeId);
  const pendingApprovals = leaves.filter(l => l.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-primary font-bold">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  return (
    <main className="space-y-6 fade-in-up">
      
      {/* Top Grid: Balance Cards & Apply Form */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (4-col on desktop): Leave Balances */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Annual Leave Balance Card */}
          <div className="glass p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest opacity-60">
                Available
              </span>
              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">beach_access</span>
              </span>
            </div>
            
            <div className="mt-4 mb-2">
              <span className="text-3xl font-extrabold text-on-background">14 Days</span>
              <span className="block text-xs font-semibold text-on-surface-variant/80 mt-1">
                Annual Leave Balance
              </span>
            </div>

            <div className="w-full bg-black/5 rounded-full h-1.5 mt-2">
              <div className="w-[70%] bg-primary h-1.5 rounded-full"></div>
            </div>

            <div className="flex justify-between text-[10px] text-outline mt-2 font-semibold">
              <span>Total: 20 Days</span>
              <span>Used: 6</span>
            </div>
          </div>

          {/* Sick Leave Balance Card */}
          <div className="glass p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest opacity-60">
                Available
              </span>
              <span className="w-9 h-9 rounded-full bg-secondary-container/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">medical_services</span>
              </span>
            </div>

            <div className="mt-4 mb-2">
              <span className="text-3xl font-extrabold text-on-background">8 Days</span>
              <span className="block text-xs font-semibold text-on-surface-variant/80 mt-1">
                Sick Leave Balance
              </span>
            </div>

            <div className="w-full bg-black/5 rounded-full h-1.5 mt-2">
              <div className="w-[40%] bg-secondary h-1.5 rounded-full"></div>
            </div>

            <div className="flex justify-between text-[10px] text-outline mt-2 font-semibold">
              <span>Total: 12 Days</span>
              <span>Used: 4</span>
            </div>
          </div>

          <button className="w-full py-3 border border-primary/20 hover:bg-primary/5 rounded-2xl text-xs font-bold text-primary transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            View Full Calendar
          </button>
        </section>

        {/* RIGHT COLUMN (8-col on desktop): Request Leave Form */}
        <section className="col-span-12 lg:col-span-8">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-on-background mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
              Request Leave
            </h3>

            {message && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-xs font-semibold">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-outline font-bold uppercase tracking-wider mb-1.5">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-white/30 border border-white/20 rounded-2xl py-2.5 px-4 text-xs font-semibold outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="paid">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-outline font-bold uppercase tracking-wider mb-1.5">Reason (Optional)</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Vacation, medical, etc."
                    className="w-full bg-white/30 border border-white/20 rounded-2xl py-2.5 px-4 text-xs outline-none focus:border-primary transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-outline font-bold uppercase tracking-wider mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/30 border border-white/20 rounded-2xl py-2.5 px-4 text-xs outline-none focus:border-primary transition-all cursor-pointer font-semibold text-on-surface-variant"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline font-bold uppercase tracking-wider mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/30 border border-white/20 rounded-2xl py-2.5 px-4 text-xs outline-none focus:border-primary transition-all cursor-pointer font-semibold text-on-surface-variant"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-outline font-bold uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Please provide more details if necessary..."
                  className="w-full bg-white/30 border border-white/20 rounded-2xl py-2.5 px-4 text-xs outline-none focus:border-primary transition-all font-semibold"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReason('');
                    setStartDate('');
                    setEndDate('');
                    setDescription('');
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-black/5 rounded-full transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:brightness-110 text-white rounded-full text-xs font-bold transition-all active:scale-95 shadow-md shadow-primary/10"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>

      {/* Team Pending Approvals Card (HR Admin view only) */}
      {user?.role === 'admin' && (
        <div className="glass p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-background">Team Pending Approvals</h3>
              <p className="text-[13px] text-outline">You have {pendingApprovals.length} requests awaiting your review.</p>
            </div>
            <button className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Approve All
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-black/10 text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3">Team Member</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Duration</th>
                  <th className="py-3">Submitted On</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm font-semibold text-on-surface-variant">
                {pendingApprovals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-outline font-medium">
                      No pending requests.
                    </td>
                  </tr>
                ) : (
                  pendingApprovals.map((req) => (
                    <tr key={req.id} className="hover:bg-white/30 transition-colors">
                      <td className="py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white flex-shrink-0">
                          <img className="w-full h-full object-cover" src={req.employeeAvatar} alt={req.employeeName} />
                        </div>
                        <span className="text-on-background font-bold">{req.employeeName}</span>
                      </td>
                      <td className="py-3.5 capitalize">{req.leaveType} Leave</td>
                      <td className="py-3.5">{req.duration} ({req.startDate} - {req.endDate})</td>
                      <td className="py-3.5 text-outline">{req.submittedOn}</td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <button
                            onClick={() => handleReviewLeave(req.id, 'rejected')}
                            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 flex items-center justify-center transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                          <button
                            onClick={() => handleReviewLeave(req.id, 'approved')}
                            className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-500 border border-green-100 flex items-center justify-center transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organization Leave History Card (HR Admin view only) */}
      {user?.role === 'admin' && (
        <div className="glass p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-on-background mb-4">Organization Leave History</h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-black/10 text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3">Team Member</th>
                  <th className="py-3">Dates</th>
                  <th className="py-3">Leave Type</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm font-semibold text-on-surface-variant">
                {leaves.filter(l => l.status !== 'pending').length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-outline font-medium">
                      No historical requests.
                    </td>
                  </tr>
                ) : (
                  leaves.filter(l => l.status !== 'pending').map((item) => {
                    let statusBadge = 'bg-primary-container/10 text-primary border-primary-container/20';
                    if (item.status === 'approved') {
                      statusBadge = 'bg-green-50 text-green-600 border-green-100';
                    } else if (item.status === 'rejected') {
                      statusBadge = 'bg-red-50 text-red-600 border-red-100';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-white/30 transition-colors">
                        <td className="py-3.5 flex items-center gap-3">
                          <span className="text-on-background font-bold">{item.employeeName}</span>
                        </td>
                        <td className="py-3.5 text-on-background font-bold">
                          {item.startDate === item.endDate ? item.startDate : `${item.startDate} - ${item.endDate}`}
                          <span className="block text-[10px] text-outline font-medium mt-0.5">{item.duration}</span>
                        </td>
                        <td className="py-3.5 capitalize">{item.leaveType} Leave</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusBadge}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-outline font-medium">{item.reason || item.description || '--'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* My Leave History Card */}
      <div className="glass p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-on-background mb-4">My Leave History</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-black/10 text-[11px] font-bold text-outline uppercase tracking-wider">
                <th className="py-3">Dates</th>
                <th className="py-3">Leave Type</th>
                <th className="py-3">Status</th>
                <th className="py-3">Reviewed By</th>
                <th className="py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm font-semibold text-on-surface-variant">
              {myHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-outline font-medium">
                    No leave history found.
                  </td>
                </tr>
              ) : (
                myHistory.map((item) => {
                  let statusBadge = 'bg-primary-container/10 text-primary border-primary-container/20';
                  if (item.status === 'approved') {
                    statusBadge = 'bg-green-50 text-green-600 border-green-100';
                  } else if (item.status === 'rejected') {
                    statusBadge = 'bg-red-50 text-red-600 border-red-100';
                  } else if (item.status === 'pending') {
                    statusBadge = 'bg-purple-50 text-purple-600 border-purple-100';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-white/30 transition-colors">
                      <td className="py-3.5 text-on-background font-bold">
                        {item.startDate === item.endDate ? item.startDate : `${item.startDate} - ${item.endDate}`}
                        <span className="block text-[10px] text-outline font-medium mt-0.5">{item.duration}</span>
                      </td>
                      <td className="py-3.5 capitalize">{item.leaveType} Leave</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusBadge}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-outline font-medium">{item.reviewedBy}</td>
                      <td className="py-3.5 text-right">
                        <button className="p-1 text-outline hover:text-primary transition-all">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
