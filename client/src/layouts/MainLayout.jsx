import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#12071a] text-[#F5EBFA] flex flex-col font-sans selection:bg-[#6E3482] selection:text-[#F5EBFA] relative overflow-x-hidden">
      {/* Ambient background glow blooms matching Uxintace palette */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#6E3482]/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-[#49225B]/25 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/3 w-[450px] h-[450px] bg-[#A56ABD]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-24">
        <Navbar toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="flex-1 p-3 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>

        {/* Minimal Footer */}
        <footer className="py-4 px-6 border-t border-[#A56ABD]/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A56ABD]">
          <p>&copy; {new Date().getFullYear()} HR Pulse &bull; Enterprise Human Resource Architecture</p>
          <div className="flex items-center gap-4 font-medium">
            <Link to="/privacy-policy" className="hover:text-[#F5EBFA] transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms-and-conditions" className="hover:text-[#F5EBFA] transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
