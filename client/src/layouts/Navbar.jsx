import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { employeeApi } from '../api';
import Avatar from '../components/common/Avatar';
import {
  Search,
  SlidersHorizontal,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Check,
  Menu,
} from 'lucide-react';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await employeeApi.getAll({ limit: 12 });
        if (res.data.success) {
          setTeamMembers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load team avatars:', err);
      }
    };
    fetchTeam();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNextAvatar = () => {
    if (teamMembers.length > 5) {
      setCarouselIndex((prev) => (prev + 1) % (teamMembers.length - 4));
    }
  };

  const handlePrevAvatar = () => {
    if (teamMembers.length > 5) {
      setCarouselIndex((prev) => (prev - 1 + (teamMembers.length - 4)) % (teamMembers.length - 4));
    }
  };

  const visibleAvatars = teamMembers.slice(carouselIndex, carouselIndex + 5);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="h-20 bg-transparent px-4 sm:px-8 flex items-center justify-between gap-4 z-30">
      {/* Left: Mobile trigger, Date, Weather & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span>{todayFormatted}</span>
            <span className="flex items-center gap-1 font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              ☀️ 28°C New Delhi
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Welcome in, <span className="text-emerald-400">{user?.name?.split(' ')[0] || 'Ayush'}</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              {teamMembers.length || 10} members
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search pill & Team Avatar carousel */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl justify-center">
        {/* Search Bar Pill */}
        <form onSubmit={handleSearchSubmit} className="relative w-56 lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here..."
            className="w-full pl-9 pr-8 py-2 bg-[#121318] hover:bg-[#16171f] focus:bg-[#181922] border border-white/10 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-200"
          />
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer" />
        </form>

        {/* Team Avatar Carousel */}
        {teamMembers.length > 0 && (
          <div className="flex items-center gap-1 bg-[#121318] p-1.5 rounded-full border border-white/10">
            <button
              onClick={handlePrevAvatar}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Previous Members"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center -space-x-2 px-1">
              {visibleAvatars.map((member) => (
                <Link
                  key={member._id}
                  to={`/employees/${member._id}`}
                  className="relative group transition-transform hover:scale-125 hover:z-20 duration-200"
                  title={`${member.firstName} ${member.lastName} (${member.designation})`}
                >
                  <img
                    src={member.profilePicture || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                    alt={member.firstName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-[#121318] ring-1 ring-white/10"
                  />
                </Link>
              ))}
            </div>

            <button
              onClick={handleNextAvatar}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Next Members"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Notifications, User Pill & Add Employee Button */}
      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#121318] hover:bg-[#181922] border border-white/10 text-slate-400 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#121318] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl p-4 z-50 bg-[#14151c] border border-white/10 shadow-2xl backdrop-blur-xl animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        n.isRead
                          ? 'bg-white/[0.02] border-white/5 text-slate-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-[#121318] hover:bg-[#181922] border border-white/10 transition-colors"
          >
            <Avatar
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              name={user?.name || 'Ayush Shukla'}
              size="sm"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">
                {user?.name || 'Ayush Shukla'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isAdmin ? 'HR Lead' : 'Staff Member'}
              </p>
            </div>
          </button>

          {/* User Menu Modal / Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl p-2 z-50 bg-[#14151c] border border-white/10 shadow-2xl backdrop-blur-xl animate-scale-up space-y-1">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Employee Pill Button */}
        {isAdmin && (
          <Link
            to="/employees"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:border-emerald-500/50 text-white text-xs font-semibold shadow-lg shadow-black/40 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Add employee</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
