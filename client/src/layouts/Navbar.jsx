import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Clock,
  RefreshCw,
  LogOut,
  User,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { attendanceApi } from '../api';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, isAdmin, logout, login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const res = await attendanceApi.getToday();
      if (res.data.success) setTodayAttendance(res.data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user]);

  const handleClockToggle = async () => {
    setClockLoading(true);
    try {
      if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
        const res = await attendanceApi.checkOut({});
        showToast(res.data.message, 'success');
      } else {
        const res = await attendanceApi.checkIn({});
        showToast(res.data.message, 'success');
      }
      fetchTodayAttendance();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleQuickRoleSwitch = async () => {
    try {
      if (isAdmin) {
        await login('sarah.jenkins@hrms.com', 'employee123');
        showToast('Switched to Employee view (Sarah Jenkins)', 'info');
      } else {
        await login('admin@hrms.com', 'admin123');
        showToast('Switched to HR Admin view (Eleanor Vance)', 'info');
      }
      navigate('/dashboard');
    } catch (err) {
      showToast('Could not switch demo user', 'error');
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('employees')) return 'Employees';
    if (path.includes('departments')) return 'Departments';
    if (path.includes('attendance')) return 'Attendance';
    if (path.includes('leaves')) return 'Leave Management';
    if (path.includes('payroll')) return 'Payroll & Compensation';
    if (path.includes('recruitment')) return 'Recruitment';
    if (path.includes('performance')) return 'Performance Appraisals';
    if (path.includes('reports')) return 'Reports & Analytics';
    if (path.includes('profile')) return 'Settings';
    if (path.includes('privacy-policy')) return 'Privacy Policy';
    if (path.includes('terms-and-conditions')) return 'Terms & Conditions';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">HR Pulse</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Attendance Punch Button */}
        <Button
          variant={
            todayAttendance?.checkIn && todayAttendance?.checkOut
              ? 'secondary'
              : todayAttendance?.checkIn
              ? 'danger'
              : 'success'
          }
          size="xs"
          icon={Clock}
          loading={clockLoading}
          onClick={handleClockToggle}
          className="hidden sm:inline-flex"
        >
          {todayAttendance?.checkIn && todayAttendance?.checkOut
            ? `Shift Done (${todayAttendance.workHours}h)`
            : todayAttendance?.checkIn
            ? 'Clock Out'
            : 'Clock In'}
        </Button>

        {/* Demo Role Switcher */}
        <Button
          variant="secondary"
          size="xs"
          icon={RefreshCw}
          onClick={handleQuickRoleSwitch}
          className="hidden md:inline-flex"
          title="Switch between Admin and Employee"
        >
          Role: {isAdmin ? 'Admin' : 'Employee'}
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl p-4 z-50 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40 text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu with Dynamic Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl p-1.5 z-50 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Account & Profile</span>
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
