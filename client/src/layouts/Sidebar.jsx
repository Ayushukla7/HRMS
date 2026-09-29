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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Enterprise Full-Featured Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0d14] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors font-sans">
                HR Pulse
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Enterprise HRMS
              </p>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(user?.role || 'employee')
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                }`}
                              />
                              <span>{item.label}</span>
                            </div>
                            {isActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-white/80" />
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
        <div className="p-4 border-t border-white/5 bg-[#080a0f]/80 space-y-3">
          <Link
            to="/profile"
            onClick={closeMobileSidebar}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-all group"
            title="Manage Profile Photo & Account"
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                src={loggedInAvatar}
                name={user?.name || 'User'}
                size="sm"
                className="ring-2 ring-indigo-500/30 group-hover:ring-cyan-400 transition-all"
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-white truncate max-w-[110px] group-hover:text-cyan-300 transition-colors">
                  {user?.name || 'Ayush Shukla'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {user?.role === 'admin' ? 'HR Administrator' : 'Staff Employee'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/15 border border-rose-500/20 transition-all cursor-pointer"
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
