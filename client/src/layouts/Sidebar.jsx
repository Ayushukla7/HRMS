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
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import Logo from '../components/common/Logo';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user, logout } = useAuth();
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
    '/avatars/ayush_shukla.png';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-xs lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Enterprise Standard Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-neutral-200 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 group"
          >
            <Logo size="sm" />
            <div>
              <h2 className="text-base font-bold tracking-tight text-black font-sans group-hover:opacity-80 transition-opacity">
                HR Pulse
              </h2>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
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
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
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
                              ? 'bg-black text-white font-semibold shadow-xs'
                              : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 ${
                                  isActive
                                    ? 'text-white'
                                    : 'text-neutral-400'
                                }`}
                              />
                              <span>{item.label}</span>
                            </div>
                            {isActive && (
                              <ChevronRight className="w-4 h-4 text-white/80" />
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
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50 space-y-2">
          <Link
            to="/profile"
            onClick={closeMobileSidebar}
            className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-200 hover:border-black transition-all shadow-xs"
            title="Manage Profile Photo & Account"
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                src={loggedInAvatar}
                name={user?.name || 'User'}
                size="sm"
                className="ring-1 ring-neutral-200"
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-semibold text-black truncate max-w-[120px]">
                  {user?.name || 'Ayush Shukla'}
                </p>
                <p className="text-[10px] text-neutral-500 capitalize">
                  {user?.role === 'admin' ? 'HR Administrator' : 'Staff Employee'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:text-white hover:bg-black border border-neutral-300 transition-colors cursor-pointer"
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
