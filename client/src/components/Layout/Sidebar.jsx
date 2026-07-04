// client/src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    ...(isAdmin ? [{ path: '/dashboard', label: 'Dashboard', icon: 'dashboard' }] : []),
    { path: '/attendance', label: 'Attendance', icon: 'fingerprint' },
    { path: '/leave', label: 'Leave', icon: 'beach_access' },
    { path: '/payroll', label: 'Payroll', icon: 'payments' },
    { path: '/profile', label: 'Profile Settings', icon: 'settings' }
  ];

  return (
    <aside className="fixed top-0 bottom-0 left-0 w-64 border-r border-white/20 bg-white/10 backdrop-blur-lg z-40 flex flex-col justify-between p-6">
      <div className="space-y-8">
        {/* Brand */}
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="material-symbols-outlined text-[28px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
            hub
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary-container">
            PeopleHub
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-2xl font-label-md text-label-md transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10 font-bold'
                    : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Quick Info */}
      <div className="p-4 bg-white/30 border border-white/20 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white">
          <img className="w-full h-full object-cover" src={user?.avatar} alt={user?.name} />
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-label-md text-on-background truncate">{user?.name}</p>
          <p className="text-[11px] text-on-surface-variant truncate capitalize">{user?.jobTitle}</p>
        </div>
      </div>
    </aside>
  );
}
