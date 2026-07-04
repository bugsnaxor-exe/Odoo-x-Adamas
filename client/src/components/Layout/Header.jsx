// client/src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    ...(isAdmin ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
    { path: '/directory', label: 'Directory' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/leave', label: 'Leave' },
    { path: '/payroll', label: 'Payroll' },
    { path: '/profile', label: 'Settings' }
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 mx-auto glass-navbar rounded-full px-8 h-16 flex items-center justify-between transition-all duration-300 w-full max-w-fit shadow-[0px_20px_40px_rgba(0,0,0,0.05)] gap-8">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isAdmin ? '/dashboard' : '/attendance')}>
        <span className="font-headline-md text-xl font-extrabold text-primary tracking-tight">
          PeopleHub
        </span>
      </div>

      {/* Navigation Links (Horizontal Menu) */}
      <div className="hidden md:flex items-center gap-6 font-semibold text-[15px]">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative py-1 text-on-surface-variant hover:text-primary transition-all duration-300 ${
                isActive ? 'text-primary font-bold' : ''
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#0058bc]"></span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Right-side Controls: Search, Notifications, Avatar */}
      <div className="flex items-center gap-4 relative">
        <button className="text-on-surface-variant hover:text-primary flex items-center justify-center p-1.5 rounded-full hover:bg-white/30 transition-all">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        <button className="text-on-surface-variant hover:text-primary flex items-center justify-center p-1.5 rounded-full hover:bg-white/30 transition-all relative">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        {/* User Menu Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/80 cursor-pointer hover:ring-2 ring-primary/30 transition-all"
          >
            <img 
              className="w-full h-full object-cover" 
              src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyyte9tmYG9UFHoFthCz5wPF3mxgbsG10SodxuAkxSwtZVsE6lrky0kXpIsCXPsRgT5h3vSA0UezrfJv2zsct5IeBE68sAbFGUW3oTgTr_fx9x-mMyvNwTNggBIj6QbdPOZF0EFSteXhHYXhCGvr9vM4Kb76aRYLVSCSt80thMYyeYg3Ce9zfMr-QoEaQHj7G5gE09tHql7du_OymoaFl6mRZRsK7JVnoEufQvL0PwxcfzAk_4xBiQ_A'} 
              alt="User profile" 
            />
          </div>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-52 rounded-2xl glass-panel shadow-lg border border-white/30 p-2.5 z-50 animate-fade-in-up">
                <div className="px-3.5 py-2 border-b border-black/5">
                  <p className="text-body-md font-bold text-on-background truncate">{user?.name}</p>
                  <p className="text-label-sm text-outline truncate capitalize">{user?.jobTitle}</p>
                </div>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-body-md hover:bg-primary/10 rounded-xl transition-all flex items-center gap-2 mt-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  View Profile
                </button>
                <button 
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3.5 py-2.5 text-body-md text-error hover:bg-error/10 rounded-xl transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
