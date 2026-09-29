import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Navbar toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Clean Enterprise Footer with Compliance Links */}
        <footer className="h-12 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>&copy; {new Date().getFullYear()} HR Pulse Systems. All rights reserved.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link to="/privacy-policy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms-and-conditions" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
