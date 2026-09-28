import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { dashboardApi, leaveApi, attendanceApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Play,
  Briefcase,
  Layers,
  Award,
  CalendarDays,
  CreditCard,
  Building2,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await dashboardApi.getAdminStats();
        if (res.data.success) setAdminData(res.data.data);
      } else {
        const res = await dashboardApi.getEmployeeStats();
        if (res.data.success) setEmployeeData(res.data.data);
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [isAdmin, user]);

  const handleLeaveDecision = async (leaveId, status) => {
    try {
      const res = await leaveApi.updateStatus(leaveId, { status });
      if (res.data.success) {
        showToast(`Leave request ${status.toLowerCase()}`, 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast('Failed to update leave', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  const { stats, departmentDistribution, attendanceSummary, recentLeaves, recentEmployees, recentApplications } = adminData || {};

  return (
    <div className="space-y-6">
      {/* Top Grid: Hero Banner + Right Widget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Hero Showcase Banner (7 cols) */}
        <div className="lg:col-span-8 rounded-[32px] overflow-hidden relative p-6 sm:p-10 flex flex-col justify-between min-h-[380px] sm:min-h-[420px] shadow-2xl transition-all border border-white/[0.08] bg-gradient-to-tr from-[#1b1717] via-[#2d201e] to-[#3a221a]">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Top Content */}
          <div className="relative z-10 max-w-md">
            <span className="text-[11px] font-bold tracking-widest uppercase text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 inline-block mb-3">
              Workforce Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3">
              Optimize <br /> Your Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Real-time employee pulse, automated shifts, leave approvals & salary distributions.
            </p>

            <Link
              to={isAdmin ? "/employees" : "/attendance"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 shadow-xl transition-transform hover:scale-105"
            >
              <span>{isAdmin ? "Manage Workforce" : "Punch In Shift"}</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>
          </div>

          {/* Hero Portrait Model Overlay (Right side background graphic) */}
          <div className="absolute right-4 sm:right-12 bottom-0 top-0 w-64 sm:w-80 pointer-events-none flex items-end justify-center overflow-hidden opacity-90">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
              alt="HR Model"
              className="h-[92%] object-cover object-top filter contrast-105 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Bottom Floating Frosted Glass Metrics Pill */}
          <div className="relative z-20 mt-8 rounded-2xl p-2 sm:p-3 glass-pill flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              {/* Metric 1 */}
              <div className="px-3 sm:px-4 py-2 rounded-xl text-left">
                <p className="text-base sm:text-xl font-black text-white">{stats?.totalEmployees || 24}k</p>
                <p className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Workforce
                </p>
              </div>

              {/* Metric 2 */}
              <div className="px-3 sm:px-4 py-2 rounded-xl text-left">
                <p className="text-base sm:text-xl font-black text-white">{stats?.attendanceRate || 94}%</p>
                <p className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Attendance
                </p>
              </div>

              {/* Metric 3 - Highlighted Orange Glow Pill */}
              <div className="px-4 sm:px-5 py-2 rounded-xl glass-pill-highlight text-left shadow-xl">
                <p className="text-base sm:text-xl font-black text-white">
                  ${stats?.totalPayrollSpent ? (stats.totalPayrollSpent / 1000).toFixed(1) + 'k' : '$58.2k'}
                </p>
                <p className="text-[10px] text-white/90 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  Disbursed
                </p>
              </div>

              {/* Metric 4 */}
              <div className="px-3 sm:px-4 py-2 rounded-xl text-left hidden sm:block">
                <p className="text-base sm:text-xl font-black text-white">{stats?.totalDepartments || 6}</p>
                <p className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Divisions
                </p>
              </div>
            </div>

            <Link
              to="/reports"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Side Widgets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Active Workforce Right Now with Glowing Wave Chart */}
          <div
            className={`p-6 rounded-[32px] glass-panel border transition-all flex flex-col justify-between shadow-xl ${
              isDark ? 'bg-[#181920]/80 border-white/[0.08]' : 'bg-white/80 border-black/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                Active Workforce right now 💡
              </span>
            </div>

            {/* Glowing Smooth SVG Wave Chart */}
            <div className="my-3 relative h-28 w-full flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                  <linearGradient id="waveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Fill Area */}
                <path
                  d="M 10,80 Q 75,10 140,65 T 270,30 L 270,100 L 10,100 Z"
                  fill="url(#waveFill)"
                />
                {/* Secondary Background Wave */}
                <path
                  d="M 10,65 Q 80,85 150,30 T 290,55"
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}
                  strokeWidth="2"
                />
                {/* Main Glowing Yellow Line */}
                <path
                  d="M 10,80 Q 75,10 140,65 T 270,30"
                  fill="none"
                  stroke="url(#waveGlow)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Data Dot Marker */}
                <circle cx="270" cy="30" r="5" fill="#facc15" className="animate-pulse" />
              </svg>

              {/* Data Bubble */}
              <div className="absolute top-2 right-4 bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                {stats?.presentToday || 18} Active
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-white/5">
              <span>9:00 AM</span>
              <span>1:00 PM</span>
              <span>4:00 PM</span>
              <span className="font-bold text-slate-200">Now</span>
            </div>
          </div>

          {/* Card 2: Latest Payroll & Growth Overview */}
          <div
            className={`p-6 rounded-[32px] glass-panel border transition-all flex items-center justify-between shadow-xl ${
              isDark ? 'bg-[#181920]/80 border-white/[0.08]' : 'bg-white/80 border-black/[0.08]'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Payouts
              </span>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-12 h-5 text-emerald-400" viewBox="0 0 50 20">
                  <path d="M 0,15 Q 15,0 25,12 T 50,5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  +6%
                </span>
              </div>
              <h3 className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                ${stats?.totalPayrollSpent ? stats.totalPayrollSpent.toLocaleString() : '58,200'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated payroll cycles</p>
            </div>

            {/* Visual 3D Icon Graphic */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center p-3 shadow-inner">
              <CreditCard className="w-10 h-10 text-orange-400 drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Showcase Section: Team Activity & Approvals */}
      <div
        className={`p-6 sm:p-8 rounded-[32px] glass-panel border transition-all shadow-2xl ${
          isDark ? 'bg-[#14151b]/80 border-white/[0.08]' : 'bg-white/80 border-black/[0.08]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-black tracking-tight">Workforce Activity & Operations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Recent team member updates, shift logs, and pending time-off workflows</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 rounded-2xl glass-pill text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Operations</option>
              <option value="leaves">Leave Requests</option>
              <option value="recruitment">Recruitment Pipeline</option>
            </select>
          </div>
        </div>

        {/* List of Frosted Rows with Mini Sparklines */}
        <div className="divide-y divide-white/5 mt-4 space-y-3">
          {recentLeaves && recentLeaves.map((leave, idx) => (
            <div
              key={leave._id || idx}
              className="p-4 rounded-2xl glass-panel hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Member & Title */}
              <div className="flex items-center gap-4">
                <img
                  src={leave.employee?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=emp${idx}`}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover bg-slate-800 ring-2 ring-orange-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {leave.leaveType} • {leave.daysCount} Day(s)
                  </p>
                </div>
              </div>

              {/* Status & Dates */}
              <div className="text-xs text-slate-400 font-mono">
                {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
              </div>

              {/* Mini Sparkline Graph */}
              <div className="hidden lg:block w-28 h-6">
                <svg className="w-full h-full text-yellow-400" viewBox="0 0 100 20">
                  <path
                    d="M 0,15 Q 25,2 50,12 T 100,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Actions / Status */}
              <div className="flex items-center gap-2">
                {isAdmin && leave.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                ) : (
                  <Badge variant={leave.status}>{leave.status}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
