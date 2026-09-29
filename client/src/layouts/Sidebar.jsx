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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Futuristic Floating Icon Rail */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-20 sm:w-24 bg-[#0a0a0c]/95 dark:bg-[#07080a]/95 border-r border-white/5 flex flex-col items-center justify-between py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Iris Sunburst Logo */}
        <div className="flex flex-col items-center">
          <NavLink
            to="/dashboard"
            onClick={closeMobileSidebar}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-700/40 via-amber-900/30 to-amber-950/20 border border-amber-500/40 hover:border-amber-400/80 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-300"
            title="HR Pulse Portal"
          >
            {/* Sunburst Iris Pattern SVG */}
            <svg viewBox="0 0 40 40" className="w-7 h-7 text-amber-300 group-hover:scale-110 transition-transform duration-300 animate-spin-slow">
              <circle cx="20" cy="20" r="4" fill="currentColor" />
              {[...Array(16)].map((_, i) => (
                <line
                  key={i}
                  x1="20"
                  y1="20"
                  x2={20 + 15 * Math.cos((i * Math.PI) / 8)}
                  y2={20 + 15 * Math.sin((i * Math.PI) / 8)}
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="2,3"
                  opacity={0.7}
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
                  `group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white border border-emerald-500/60 shadow-lg shadow-emerald-500/20 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20'
                  }`
                }
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />

                {/* Floating Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3.5 px-2.5 py-1 rounded-md bg-[#181920] border border-white/10 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Exit / Logout Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleLogout}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/40 transition-all duration-200"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="pointer-events-none absolute left-full ml-3.5 px-2.5 py-1 rounded-md bg-[#181920] border border-white/10 text-xs font-semibold text-rose-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
