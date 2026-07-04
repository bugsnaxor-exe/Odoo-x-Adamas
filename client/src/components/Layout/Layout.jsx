// client/src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen relative flex flex-col w-full ios-gradient-soft">
      {/* Dynamic Background Blobs */}
      <div className="bg-blobs">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>

      {/* Floating Header Navbar */}
      <Header />
      
      {/* Content wrapper taking full width (no sidebar) */}
      <div className="flex-grow flex flex-col w-full px-4 sm:px-6 md:px-8 pt-28 pb-12 max-w-7xl mx-auto">
        <div className="flex-grow">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="w-full py-8 mt-12 flex flex-col md:flex-row justify-between items-center border-t border-white/20">
          <div className="text-label-md font-bold text-on-surface mb-3 md:mb-0">
            PeopleHub
          </div>
          <div className="text-body-md text-on-surface-variant opacity-70 mb-3 md:mb-0">
            © 2024 PeopleHub HRMS. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm" href="#" onClick={(e) => e.preventDefault()}>Support</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
