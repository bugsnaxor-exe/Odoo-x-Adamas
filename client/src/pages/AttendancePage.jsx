// client/src/pages/AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function AttendancePage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendanceData = async () => {
    try {
      const myAtts = await apiService.getMyAttendance();
      const emps = await apiService.getEmployees();
      setAttendance(myAtts);
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to fetch attendance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const handleCheckInToggle = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = attendance.find(a => a.date === todayStr);

      if (hasCheckedInToday) {
        if (!hasCheckedInToday.checkOut) {
          await apiService.checkOut();
        }
      } else {
        await apiService.checkIn();
      }
      fetchAttendanceData();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.date === todayStr);
  const isCheckedIn = todayRecord && !todayRecord.checkOut;

  // Render calendar grid for October 2024
  const renderCalendar = () => {
    const days = [];
    // October 2024 starts on Tuesday (index 1 in 0-indexed week starting Mon)
    // Mon is Tuesday 1, so offset by 1
    for (let i = 0; i < 1; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    for (let i = 1; i <= 31; i++) {
      let isSpecial = i === 24;
      let dotColor = null;
      if (i < 10 && i !== 6) dotColor = "bg-primary";
      if (i === 15 || i === 16) dotColor = "bg-secondary";

      days.push(
        <div 
          key={i} 
          className={`relative aspect-square flex items-center justify-center rounded-full text-label-sm font-semibold cursor-pointer hover:bg-black/5 transition-all ${
            isSpecial 
              ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105' 
              : 'text-on-surface'
          }`}
        >
          {i}
          {dotColor && !isSpecial && (
            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor}`}></span>
          )}
        </div>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-primary font-bold">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  return (
    <main className="grid grid-cols-12 gap-6 fade-in-up">
      
      {/* LEFT COLUMN (4-col on desktop): Check-In, Summary, Calendar */}
      <section className="col-span-12 lg:col-span-4 space-y-6">
        
        {/* Current Time Clock */}
        <div className="glass p-6 rounded-3xl text-center flex flex-col items-center relative overflow-hidden">
          <span className="text-[11px] text-outline font-bold uppercase tracking-widest opacity-60">
            Current Time
          </span>
          <h2 className="text-3xl md:text-4xl text-primary font-extrabold mt-1 tracking-tight">
            {formatTime(time)}
          </h2>
          <p className="text-[13px] text-on-surface-variant/80 font-medium mt-0.5">
            {formatDate(time)}
          </p>

          <button
            onClick={handleCheckInToggle}
            className={`w-full mt-6 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 transform active:scale-95 shadow-md ${
              isCheckedIn
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'ios-gradient-primary text-white shadow-primary/20 hover:brightness-110'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCheckedIn ? 'logout' : 'fingerprint'}
            </span>
            {isCheckedIn ? 'Check Out Now' : 'Check In Now'}
          </button>

          <p className="text-[12px] text-outline mt-3.5">
            {isCheckedIn
              ? `Checked in at ${todayRecord.checkIn}`
              : todayRecord?.checkOut
              ? `Last activity: Checked out at ${todayRecord.checkOut} today`
              : 'Last activity: Checked out at 06:15 PM yesterday'}
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="glass p-6 rounded-3xl">
          <h3 className="text-body-lg font-bold text-on-background mb-4">Quick Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/40 border border-white/30 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div>
                <div className="text-[9px] text-outline uppercase font-bold tracking-wider">Avg. Arrival</div>
                <div className="font-bold text-sm text-primary">09:05 AM</div>
              </div>
            </div>
            <div className="p-3 bg-white/40 border border-white/30 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary-container/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
              </div>
              <div>
                <div className="text-[9px] text-outline uppercase font-bold tracking-wider">Total Hours</div>
                <div className="font-bold text-sm text-secondary">168.5h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="glass p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-body-lg font-bold text-on-background">October 2024</h3>
            <div className="flex gap-1 text-outline">
              <button className="p-1 rounded-full hover:bg-black/5">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </button>
              <button className="p-1 rounded-full hover:bg-black/5">
                <span className="material-symbols-outlined text-lg">tune</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-outline uppercase tracking-wider opacity-60">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {renderCalendar()}
          </div>
        </div>

      </section>

      {/* RIGHT COLUMN (8-col on desktop): Weekly Activity & Team Monitor */}
      <section className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* Weekly Activity Status indicators */}
        <div className="glass p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-background">Weekly Activity</h3>
              <p className="text-[13px] text-outline">Visual status indicators for the last 7 days</p>
            </div>
            <div className="flex gap-1 border border-black/5 rounded-full bg-white/20 p-0.5">
              <button className="p-1 rounded-full hover:bg-white/50 text-outline">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button className="p-1 rounded-full hover:bg-white/50 text-outline">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 h-48 items-end text-center mb-6">
            {[
              { label: 'Mon', height: 'h-[65%]', color: 'bg-primary' },
              { label: 'Tue', height: 'h-[75%]', color: 'bg-primary' },
              { label: 'Wed', height: 'h-[40%]', color: 'bg-red-400' },
              { label: 'Thu', height: 'h-[85%]', color: 'bg-secondary' },
              { label: 'Fri', height: 'h-[50%]', color: 'bg-primary' },
              { label: 'Sat', height: 'h-[10%]', color: 'bg-black/5' },
              { label: 'Sun', height: 'h-[10%]', color: 'bg-black/5' }
            ].map((day, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-between">
                <div className="w-6 md:w-10 bg-black/5 rounded-full h-[85%] relative flex items-end">
                  <div className={`w-full ${day.height} ${day.color} rounded-full`}></div>
                </div>
                <span className="text-[12px] text-on-surface-variant font-medium mt-1">{day.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-label-sm font-semibold opacity-85">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Half-day</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Remote</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Absent</span>
          </div>
        </div>

        {/* Team Monitoring list */}
        <div className="glass p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-background">Team Monitoring</h3>
              <p className="text-[13px] text-outline">Live status of your direct reports</p>
            </div>
            <span className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
              12 / 15 Active
            </span>
          </div>

          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {employees
              .filter(e => e.id !== user?.id)
              .map((emp) => {
                let statusBg = 'bg-green-100/60 text-green-600 border-green-200/40';
                let statusDot = 'bg-green-500';
                if (emp.status === 'On Leave') {
                  statusBg = 'bg-red-100/60 text-red-600 border-red-200/40';
                  statusDot = 'bg-red-500';
                } else if (emp.status === 'Remote') {
                  statusBg = 'bg-purple-100/60 text-purple-600 border-purple-200/40';
                  statusDot = 'bg-purple-500';
                } else if (emp.status === 'Out of Office') {
                  statusBg = 'bg-gray-100/60 text-gray-500 border-gray-200/40';
                  statusDot = 'bg-gray-400';
                }

                return (
                  <div key={emp.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-white/20 hover:bg-white/60 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                        <img className="w-full h-full object-cover" src={emp.avatar} alt={emp.name} />
                      </div>
                      <div>
                        <div className="font-bold text-body-md text-on-background">{emp.name}</div>
                        <div className="text-label-sm text-outline font-medium">{emp.jobTitle}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-outline uppercase font-bold tracking-wider">In Time</div>
                        <div className="text-sm font-bold text-on-background">08:55 AM</div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                        {emp.status}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </section>

    </main>
  );
}
