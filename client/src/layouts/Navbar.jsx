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

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-20 bg-transparent px-4 sm:px-8 flex items-center justify-between gap-4 z-30">
      {/* Left: Mobile trigger, Date, Weather & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-2.5 rounded-2xl text-[#E7DBEF] hover:text-[#F5EBFA] bg-[#271337] border border-[#A56ABD]/30 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5 text-xs text-[#E7DBEF]/80 font-medium">
            <span>{todayFormatted}</span>
            <span className="flex items-center gap-1 font-bold text-[#F5EBFA] bg-[#6E3482]/40 px-2.5 py-0.5 rounded-full border border-[#A56ABD]/40 shadow-xs">
              ☀️ 28°C New Delhi
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EBFA] font-sans">
              Welcome in, <span className="text-[#A56ABD] font-black">{user?.name?.split(' ')[0] || 'Ayush'}</span>
            </h1>
            <span className="text-xs text-[#E7DBEF]/70 font-semibold font-mono">
              ({teamMembers.length || 10} members)
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search pill & Team Avatar carousel */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl justify-center">
        {/* Search Bar Pill */}
        <form onSubmit={handleSearchSubmit} className="relative w-56 lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A56ABD]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search personnel, IDs, skills..."
            className="w-full pl-9 pr-8 py-2 bg-[#1c0d28] hover:bg-[#271337] focus:bg-[#271337] border border-[#A56ABD]/30 rounded-full text-xs text-[#F5EBFA] placeholder-[#A56ABD]/60 focus:outline-none focus:border-[#A56ABD] transition-all duration-200 font-medium shadow-sm"
          />
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A56ABD] hover:text-[#F5EBFA] cursor-pointer" />
        </form>

        {/* Team Avatar Carousel */}
        {teamMembers.length > 0 && (
          <div className="flex items-center gap-1 bg-[#1c0d28] p-1.5 rounded-full border border-[#A56ABD]/25 shadow-sm">
            <button
              onClick={handlePrevAvatar}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#A56ABD] hover:text-[#F5EBFA] hover:bg-[#6E3482]/30 transition-colors"
              title="Previous Indian Members"
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
                    src={
                      member.profilePicture ||
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'
                    }
                    alt={member.firstName}
                    className="w-8 h-8 rounded-full object-cover object-top border-2 border-[#1c0d28] ring-1 ring-[#A56ABD]/40"
                  />
                </Link>
              ))}
            </div>

            <button
              onClick={handleNextAvatar}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#A56ABD] hover:text-[#F5EBFA] hover:bg-[#6E3482]/30 transition-colors"
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
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1c0d28] hover:bg-[#271337] border border-[#A56ABD]/30 text-[#E7DBEF] hover:text-[#F5EBFA] transition-colors relative shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#A56ABD] rounded-full ring-2 ring-[#1c0d28] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl p-4 z-50 bg-[#1c0d28] border border-[#A56ABD]/35 shadow-2xl backdrop-blur-2xl animate-scale-up shadow-[#49225B]/50">
              <div className="flex items-center justify-between pb-3 border-b border-[#A56ABD]/20 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5EBFA]">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6E3482]/40 text-[#F5EBFA] text-[10px] font-bold border border-[#A56ABD]/40">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#A56ABD] hover:text-[#F5EBFA] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-[#A56ABD] text-xs font-medium">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                        n.isRead
                          ? 'bg-[#271337]/50 border-[#A56ABD]/15 text-[#E7DBEF]/70'
                          : 'bg-[#6E3482]/25 border-[#A56ABD]/40 text-[#F5EBFA] font-medium shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#F5EBFA]">{n.title}</span>
                        <span className="text-[10px] text-[#A56ABD] font-mono">
                          {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#E7DBEF] leading-relaxed line-clamp-2">{n.message}</p>
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
            className="flex items-center gap-2.5 p-1 pr-3.5 rounded-full bg-[#1c0d28] hover:bg-[#271337] border border-[#A56ABD]/30 transition-colors shadow-sm"
          >
            <Avatar
              src={
                user?.avatar ||
                user?.employee?.profilePicture ||
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'
              }
              name={user?.name || 'Ayush Shukla'}
              size="sm"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-[#F5EBFA] leading-none">
                {user?.name || 'Ayush Shukla'}
              </p>
              <p className="text-[11px] text-[#A56ABD] font-semibold mt-0.5">
                {isAdmin ? 'HR Lead & Admin' : 'Staff Member'}
              </p>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 rounded-3xl p-2.5 z-50 bg-[#1c0d28] border border-[#A56ABD]/35 shadow-2xl backdrop-blur-2xl animate-scale-up space-y-1 shadow-[#49225B]/50">
              <div className="px-3.5 py-2.5 border-b border-[#A56ABD]/20 mb-1">
                <p className="text-xs font-bold text-[#F5EBFA] truncate font-sans">{user?.name}</p>
                <p className="text-[11px] text-[#A56ABD] truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-[#E7DBEF] hover:text-[#F5EBFA] hover:bg-[#6E3482]/30 transition-colors"
              >
                <User className="w-4 h-4 text-[#A56ABD]" />
                <span>My Profile & Photo</span>
              </Link>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-[#E7DBEF] hover:text-[#F5EBFA] hover:bg-[#6E3482]/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-[#A56ABD]" /> : <Moon className="w-4 h-4 text-[#A56ABD]" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#6E3482] to-[#A56ABD] hover:from-[#7f3d96] hover:to-[#b67cd0] border border-[#F5EBFA]/30 text-[#F5EBFA] text-xs font-bold shadow-lg shadow-[#49225B]/40 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Add employee</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
