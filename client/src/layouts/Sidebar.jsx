import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Mail,
  TrendingUp,
  Users,
  Briefcase,
  CreditCard,
  Building2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
    { label: 'Attendance', path: '/attendance', icon: Calendar, roles: ['admin', 'employee'] },
    { label: 'Leaves & Approvals', path: '/leaves', icon: Mail, roles: ['admin', 'employee'] },
    { label: 'Performance', path: '/performance', icon: TrendingUp, roles: ['admin', 'employee'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['admin', 'employee'] },
    { label: 'Recruitment ATS', path: '/recruitment', icon: Briefcase, roles: ['admin'] },
    { label: 'Payroll', path: '/payroll', icon: CreditCard, roles: ['admin', 'employee'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['admin', 'employee'] },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#12071a]/80 backdrop-blur-md lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Floating Icon Rail styled with Uxintace Plum/Purple Palette */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-20 sm:w-24 bg-[#12071a]/95 border-r border-[#A56ABD]/20 flex flex-col items-center justify-between py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 backdrop-blur-xl ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Iris Sunburst Logo */}
        <div className="flex flex-col items-center">
          <NavLink
            to="/dashboard"
            onClick={closeMobileSidebar}
            className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-br from-[#6E3482] via-[#49225B] to-[#1c0d28] border border-[#A56ABD]/50 hover:border-[#F5EBFA]/80 shadow-lg shadow-[#49225B]/40 hover:shadow-[#6E3482]/60 transition-all duration-300"
            title="HR Pulse Portal"
          >
            {/* Sunburst Iris Pattern SVG */}
            <svg viewBox="0 0 40 40" className="w-8 h-8 text-[#F5EBFA] group-hover:scale-110 transition-transform duration-300 animate-spin-slow">
              <circle cx="20" cy="20" r="4" fill="currentColor" />
              {[...Array(16)].map((_, i) => (
                <line
                  key={i}
                  x1="20"
                  y1="20"
                  x2={20 + 15 * Math.cos((i * Math.PI) / 8)}
                  y2={20 + 15 * Math.sin((i * Math.PI) / 8)}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeDasharray="2,3"
                  opacity={0.85}
                />
              ))}
            </svg>
          </NavLink>
        </div>

        {/* Central Circular Navigation Buttons */}
        <div className="flex flex-col items-center gap-3.5 my-auto py-2">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#6E3482] to-[#49225B] text-[#F5EBFA] border border-[#A56ABD] shadow-lg shadow-[#6E3482]/50 scale-105'
                      : 'text-[#E7DBEF]/70 hover:text-[#F5EBFA] hover:bg-[#271337] border border-[#A56ABD]/20 hover:border-[#A56ABD]/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />

                {/* Tooltip on Hover */}
                <div className="absolute left-full ml-3 px-3 py-1 bg-[#1c0d28] border border-[#A56ABD]/40 text-[#F5EBFA] text-xs font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center w-11 h-11 rounded-full text-[#A56ABD] hover:text-rose-300 hover:bg-rose-500/20 border border-[#A56ABD]/20 hover:border-rose-400/40 transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1 bg-[#1c0d28] border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Sign Out
          </div>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
