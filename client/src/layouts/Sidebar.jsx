import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Briefcase,
  TrendingUp,
  BarChart3,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['admin', 'employee'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['admin', 'employee'] },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'employee'] },
    { label: 'Leave Desk', path: '/leaves', icon: CalendarDays, roles: ['admin', 'employee'] },
    { label: 'Payroll', path: '/payroll', icon: CreditCard, roles: ['admin', 'employee'] },
    { label: 'Recruitment', path: '/recruitment', icon: Briefcase, roles: ['admin'] },
    { label: 'Performance', path: '/performance', icon: TrendingUp, roles: ['admin', 'employee'] },
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-black text-sm shadow-sm">
              HP
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                HR Pulse
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Enterprise HRMS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Operations
            </p>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom User Snapshot with Dynamic Avatar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <NavLink
            to="/profile"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role || 'Employee'}</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
