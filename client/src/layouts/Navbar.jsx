import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Avatar from '../components/common/Avatar';
import {
  Search,
  Bell,
  LogOut,
  User,
  Menu,
} from 'lucide-react';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Format today's date in Indian locale
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const loggedInAvatar =
    user?.avatar ||
    user?.employee?.profilePicture ||
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80';

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between gap-4 z-30 sticky top-0">
      {/* Left: Mobile trigger, Date, Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold text-black">{todayFormatted}</span>
            <span>&bull;</span>
            <span className="font-semibold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-300">
              New Delhi HQ
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md mx-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees, departments, IDs..."
            className="w-full pl-9 pr-4 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-normal"
          />
        </form>
      </div>

      {/* Right: Controls (Notifications, Profile Dropdown) */}
      <div className="flex items-center gap-2">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
              <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-black">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-neutral-600 hover:text-black hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">No notifications yet</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs transition-colors cursor-pointer ${
                        !n.isRead
                          ? 'bg-neutral-50 font-semibold'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <p className="text-black">{n.title}</p>
                      <p className="text-neutral-500 text-[11px] mt-0.5 font-normal">{n.message}</p>
                      <span className="text-[10px] text-neutral-400 mt-1 block font-normal">
                        {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Avatar src={loggedInAvatar} name={user?.name || 'User'} size="sm" />
            <span className="hidden md:block text-xs font-semibold text-black">
              {user?.name?.split(' ')[0] || 'Ayush'}
            </span>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-xs font-bold text-black">{user?.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:text-black hover:bg-neutral-50"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </Link>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:text-black hover:bg-neutral-50 text-left font-medium"
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
