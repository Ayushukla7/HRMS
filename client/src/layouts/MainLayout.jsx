import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Minimal Clean Footer */}
        <footer className="py-4 px-6 border-t border-neutral-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} HR Pulse &bull; Enterprise Human Resource Management</p>
          <div className="flex items-center gap-4 font-medium">
            <Link to="/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms-and-conditions" className="hover:text-black transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
