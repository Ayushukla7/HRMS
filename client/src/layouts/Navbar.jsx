import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Mail,
  Clock,
  CheckCircle2,
  RefreshCw,
  LogOut,
  User,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { attendanceApi } from '../api';

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

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('employees')) return 'Workforce Directory';
    if (path.includes('departments')) return 'Departments & Organization';
    if (path.includes('attendance')) return 'Time & Attendance Tracker';
    if (path.includes('leaves')) return 'Time Off & Leave Desk';
    if (path.includes('payroll')) return 'Compensation & Payroll';
    if (path.includes('recruitment')) return 'Talent Acquisition (ATS)';
    if (path.includes('performance')) return 'Performance Appraisals';
    if (path.includes('reports')) return 'Executive HR Analytics';
    if (path.includes('profile')) return 'Security & Profile';
    return 'Workforce Hub';
  };

  return (
    <header className="h-20 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Hamburger & Dynamic Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-2.5 rounded-2xl glass-panel text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>{getPageTitle()}</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right: Quick Punch, Demo Switcher, Theme, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Shift Punch */}
        <button
          onClick={handleClockToggle}
          disabled={clockLoading}
          className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
            todayAttendance?.checkIn && todayAttendance?.checkOut
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : todayAttendance?.checkIn
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {todayAttendance?.checkIn && todayAttendance?.checkOut
              ? `Completed (${todayAttendance.workHours}h)`
              : todayAttendance?.checkIn
              ? `Clock Out`
              : 'Clock In'}
          </span>
        </button>

        {/* Demo Role Switcher */}
        <button
          onClick={handleQuickRoleSwitch}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all glass-panel ${
            isDark ? 'text-amber-300 hover:bg-white/10' : 'text-indigo-600 hover:bg-slate-100'
          }`}
          title="Switch Demo Role"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Role: {isAdmin ? 'Admin' : 'Employee'}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`p-2.5 rounded-2xl glass-panel relative transition-all ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-[#14151b] animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-[#14151b]" />
            )}
          </button>

          {notifOpen && (
            <div
              className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl p-4 z-50 glass-panel shadow-2xl border ${
                isDark ? 'bg-[#181920]/95 border-white/10' : 'bg-white/95 border-black/10'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-orange-400 hover:underline font-semibold"
                  >
                    Mark read
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
                      className={`p-3 rounded-2xl border text-xs transition-colors cursor-pointer ${
                        n.isRead
                          ? isDark ? 'bg-white/[0.02] border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                          : isDark ? 'bg-orange-500/10 border-orange-500/20 text-slate-200' : 'bg-orange-50 border-orange-200 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl glass-panel hover:ring-2 hover:ring-orange-500/40 transition-all"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt=""
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-500/30"
            />
          </button>

          {profileOpen && (
            <div
              className={`absolute right-0 mt-3 w-56 rounded-3xl p-3 z-50 glass-panel shadow-2xl border ${
                isDark ? 'bg-[#181920]/95 border-white/10' : 'bg-white/95 border-black/10'
              }`}
            >
              <div className="p-3 border-b border-white/10">
                <p className="text-xs font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-2 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-white/10 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account & Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
