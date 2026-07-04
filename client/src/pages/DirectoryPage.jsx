// client/src/pages/DirectoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function DirectoryPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const emps = await apiService.getEmployees();
        setEmployees(emps);
      } catch (err) {
        console.error('Failed to load employee directory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const departments = ['All', 'Engineering', 'Design', 'Product'];

  const filteredEmployees = filter === 'All'
    ? employees
    : employees.filter(emp => emp.department === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-primary font-bold">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  return (
    <main className="space-y-6 fade-in-up relative">
      
      {/* Header and Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Employee Directory</h1>
          <p className="text-[14px] text-on-surface-variant/80 mt-0.5">Manage and connect with your global team members.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setFilter(dept)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                filter === dept
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'bg-white/40 border border-white/20 text-on-surface-variant hover:bg-white/60'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => {
          const isAway = emp.status === 'Out of Office' || emp.status === 'On Leave';
          
          let statusDotColor = 'bg-green-500';
          if (emp.status === 'On Leave') statusDotColor = 'bg-red-500';
          if (emp.status === 'Remote') statusDotColor = 'bg-purple-500';
          if (emp.status === 'Out of Office') statusDotColor = 'bg-gray-400';

          return (
            <div 
              key={emp.id} 
              className="glass p-6 rounded-3xl flex flex-col items-center text-center justify-between border border-white/30 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                {/* Avatar with Status Dot */}
                <div className="relative w-24 h-24 rounded-full border-2 border-white shadow-md mb-4 flex-shrink-0">
                  <img className="w-full h-full object-cover rounded-full" src={emp.avatar} alt={emp.name} />
                  <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statusDotColor}`}></span>
                </div>

                <h3 className="font-bold text-lg text-on-background truncate w-full px-2">{emp.name}</h3>
                <p className="text-[12px] text-outline font-semibold uppercase mt-0.5 tracking-wide truncate w-full px-2">
                  {emp.jobTitle}
                </p>

                {/* Skill Tags */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {emp.tags && emp.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-0.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full mt-6">
                {isAway ? (
                  <div className="w-full py-2 bg-gray-100/60 border border-gray-200/40 text-gray-500 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {emp.status}
                  </div>
                ) : (
                  <button className="w-full py-2 bg-primary/10 hover:bg-primary/25 border border-primary/10 text-primary text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                    Message
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Members Centered Dropdown */}
      <div className="flex justify-center pt-8">
        <button className="px-5 py-2.5 bg-white/40 border border-white/20 hover:bg-white/60 text-on-surface-variant font-bold text-xs rounded-full flex items-center gap-1.5 transition-all">
          Load More Members
          <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
        </button>
      </div>

      {/* Floating Action Button (FAB) + in Bottom-Right Corner - Admin Only */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button className="w-12 h-12 rounded-full bg-primary hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-2xl font-bold">add</span>
          </button>
        </div>
      )}

    </main>
  );
}
