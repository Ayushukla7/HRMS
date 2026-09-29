import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
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
  BarChart3,
  UserCheck,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Main Navigation',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
      ],
    },
    {
      title: 'Workforce & Talent',
      items: [
        { label: 'Employees Directory', path: '/employees', icon: Users, roles: ['admin', 'employee'] },
        { label: 'Departments', path: '/departments', icon: Building2, roles: ['admin', 'employee'] },
        { label: 'Recruitment ATS', path: '/recruitment', icon: Briefcase, roles: ['admin'] },
      ],
    },
    {
      title: 'Time & Attendance',
      items: [
        { label: 'Attendance Tracker', path: '/attendance', icon: Calendar, roles: ['admin', 'employee'] },
        { label: 'Leaves & Approvals', path: '/leaves', icon: Mail, roles: ['admin', 'employee'] },
      ],
    },
    {
      title: 'Compensation & Growth',
      items: [
        { label: 'Payroll & Salaries', path: '/payroll', icon: CreditCard, roles: ['admin', 'employee'] },
        { label: 'Performance & OKRs', path: '/performance', icon: TrendingUp, roles: ['admin', 'employee'] },
        { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['admin'] },
      ],
    },
  ];

  const loggedInAvatar =
    user?.avatar ||
    user?.employee?.profilePicture ||
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Enterprise Standard Clean Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                HR Pulse
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Enterprise HRMS
              </p>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(user?.role || 'employee')
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 ${
                                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                                }`}
                              />
                              <span>{item.label}</span>
                            </div>
                            {isActive && (
                              <ChevronRight className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Account & Logout Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          <Link
            to="/profile"
            onClick={closeMobileSidebar}
            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/40 transition-all shadow-xs"
            title="Manage Profile Photo & Account"
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                src={loggedInAvatar}
                name={user?.name || 'User'}
                size="sm"
                className="ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user?.name || 'Ayush Shukla'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role === 'admin' ? 'HR Administrator' : 'Staff Employee'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
