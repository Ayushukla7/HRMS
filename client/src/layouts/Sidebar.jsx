import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Briefcase,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { unreadCount } = useNotification();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid, roles: ['admin', 'employee'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['admin', 'employee'] },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'employee'] },
    { label: 'Leaves', path: '/leaves', icon: CalendarDays, roles: ['admin', 'employee'] },
    { label: 'Payroll', path: '/payroll', icon: CreditCard, roles: ['admin', 'employee'] },
    { label: 'Recruitment', path: '/recruitment', icon: Briefcase, roles: ['admin'] },
    { label: 'Performance', path: '/performance', icon: TrendingUp, roles: ['admin', 'employee'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['admin', 'employee'] },
    { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Floating Glass Icon Rail */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-40 w-16 md:w-20 rounded-3xl flex flex-col items-center justify-between py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 glass-panel shadow-2xl border ${
          isDark
            ? 'bg-[#14151b]/80 border-white/[0.08] text-slate-300'
            : 'bg-white/80 border-black/[0.08] text-slate-700 shadow-slate-200/60'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-28'}`}
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full rounded-[14px] bg-[#14151b] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          {/* Navigation Icons List */}
          <nav className="flex flex-col items-center gap-2.5">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  title={item.label}
                  className={({ isActive }) =>
                    `group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-white/15 text-white shadow-inner border border-white/20'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : isDark
                        ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                        : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {/* Tooltip on hover */}
                      <span className="absolute left-full ml-3.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl bg-slate-900 text-white border border-slate-700">
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Theme Toggle, Notifications, Profile */}
        <div className="flex flex-col items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isDark
                ? 'hover:bg-white/10 text-amber-400'
                : 'hover:bg-slate-100 text-indigo-600'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings / Profile link */}
          <NavLink
            to="/profile"
            title="Profile & Settings"
            className={({ isActive }) =>
              `w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-white/20 text-white'
                  : isDark
                  ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Settings className="w-4 h-4" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
