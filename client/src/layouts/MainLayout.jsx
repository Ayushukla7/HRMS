import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-[#0f1015] text-slate-100' : 'bg-[#f4f5f8] text-slate-900'
      } flex p-2 sm:p-4 md:p-6`}
    >
      {/* Sleek Floating Glass Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Main Glass Application Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-24 transition-all duration-300">
        <Navbar toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="flex-1 px-2 sm:px-6 pb-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
