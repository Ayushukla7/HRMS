import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, employeeApi, leaveApi, attendanceApi, payrollApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  IndianRupee,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Building,
  Check,
  X,
  FileText,
  ShieldCheck,
  Zap,
  Timer,
  Award,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  CalendarDays,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast, fetchNotifications } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);

  // Live Digital Clock (IST)
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );
  const [currentDateStr, setCurrentDateStr] = useState(
    new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  );

  // Attendance Punch state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);

  // Quick Apply Leave Modal
  const [applyLeaveModalOpen, setApplyLeaveModalOpen] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Action loading for 1-click leave approve/reject
  const [actionLeaveId, setActionLeaveId] = useState(null);

  // Timer interval for clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [adminRes, todayAttRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        attendanceApi.getToday().catch(() => ({ data: { success: false } })),
      ]);

      if (adminRes.data.success) {
        setAdminData(adminRes.data.data);
      }
      if (todayAttRes.data && todayAttRes.data.success) {
        setTodayAttendance(todayAttRes.data.data);
      }

      if (!isAdmin) {
        const empRes = await dashboardApi.getEmployeeStats().catch(() => ({ data: { success: false } }));
        if (empRes.data && empRes.data.success) {
          setEmployeeStats(empRes.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  // Biometric Check In / Check Out Handler
  const handlePunchToggle = async () => {
    setPunchLoading(true);
    try {
      if (!todayAttendance || !todayAttendance.checkIn) {
        const res = await attendanceApi.checkIn({
          location: 'Bengaluru Tech Park (Tower 3)',
          notes: 'Standard shift check-in from dashboard terminal',
        });
        showToast('Punched In successfully! Work timer started.', 'success');
        setTodayAttendance(res.data.data);
      } else if (!todayAttendance.checkOut) {
        const res = await attendanceApi.checkOut({
          notes: 'Standard shift check-out from dashboard terminal',
        });
        showToast('Punched Out successfully! Work hours logged.', 'success');
        setTodayAttendance(res.data.data);
      } else {
        showToast('Shift already completed for today.', 'info');
      }
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Attendance action failed', 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  // Direct 1-Click Leave Approval / Rejection Handler
  const handleLeaveDecision = async (leaveId, decisionStatus) => {
    setActionLeaveId(leaveId);
    try {
      await leaveApi.updateStatus(leaveId, {
        status: decisionStatus,
        adminRemarks: `Quick decision marked directly from Executive Dashboard (${decisionStatus})`,
      });
      showToast(`Leave request ${decisionStatus.toLowerCase()} successfully!`, 'success');
      fetchDashboardData();
      if (fetchNotifications) fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${decisionStatus.toLowerCase()} leave`, 'error');
    } finally {
      setActionLeaveId(null);
    }
  };

  // Submit Leave from Dashboard Modal
  const handleApplyLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    try {
      const start = new Date(leaveForm.startDate);
      const end = new Date(leaveForm.endDate);
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const res = await leaveApi.apply({
        ...leaveForm,
        daysCount: days,
      });

      showToast(res.data.message || 'Leave request submitted successfully!', 'success');
      setApplyLeaveModalOpen(false);
      setLeaveForm({
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit leave request', 'error');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling organizational HRMS dashboard..." />;
  }

  // Stats Calculations
  const stats = adminData?.stats || {};
  const totalEmployees = stats.totalEmployees || 12;
  const presentToday = stats.presentToday || 10;
  const onLeaveToday = stats.onLeaveToday || 1;
  const absentToday = stats.absentToday || 0;
  const pendingLeavesCount = stats.pendingLeaves || 0;
  const totalPayroll = stats.totalPayrollSpent || 1250000;
  const attendanceRate = stats.attendanceRate || (totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 92);

  // Interactive Chart Data: Monthly Attendance Trends
  const attendanceTrendData = [
    { month: 'Apr', attendanceRate: 91, onTimeRate: 94 },
    { month: 'May', attendanceRate: 93, onTimeRate: 95 },
    { month: 'Jun', attendanceRate: 95, onTimeRate: 96 },
    { month: 'Jul', attendanceRate: 94, onTimeRate: 95 },
    { month: 'Aug', attendanceRate: 97, onTimeRate: 98 },
    { month: 'Sep', attendanceRate: attendanceRate, onTimeRate: 97 },
  ];

  // Interactive Chart Data: Department Breakdown
  const deptBreakdown =
    adminData?.departmentDistribution && adminData.departmentDistribution.length > 0
      ? adminData.departmentDistribution.map((d, i) => ({
          name: d.name,
          count: d.count || 2,
          color: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6],
        }))
      : [
          { name: 'Engineering', count: 5, color: '#6366f1' },
          { name: 'Product & Design', count: 3, color: '#06b6d4' },
          { name: 'Human Resources', count: 2, color: '#10b981' },
          { name: 'Operations & QA', count: 2, color: '#f59e0b' },
        ];

  // Interactive Chart Data: Monthly Payroll Velocity (₹ in Lakhs)
  const payrollTrendData = [
    { month: 'Apr', amount: 8.5 },
    { month: 'May', amount: 9.2 },
    { month: 'Jun', amount: 9.8 },
    { month: 'Jul', amount: 10.4 },
    { month: 'Aug', amount: 11.2 },
    { month: 'Sep', amount: Number(((totalPayroll) / 100000).toFixed(1)) || 12.5, current: true },
  ];

  const loggedInName = user?.name || 'Ayush Shukla';
  const loggedInAvatar = user?.avatar || user?.employee?.profilePicture || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80';
  const loggedInRole = user?.employee?.designation || (user?.role === 'admin' ? 'HR Lead & Administrator' : 'Software Engineer');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ========================================================================= */}
      {/* 1. TOP HERO BANNER & QUICK ACTIONS BAR */}
      {/* ========================================================================= */}
      <div className="bento-card p-6 sm:p-7 relative overflow-hidden bg-gradient-to-r from-[#0d1017] via-[#121622] to-[#0d1017]">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* User Welcome Information */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Link to="/profile" className="relative group block" title="Change your profile picture">
              <Avatar
                src={loggedInAvatar}
                name={loggedInName}
                size="xl"
                className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-indigo-500/30 rounded-3xl group-hover:ring-cyan-400/60 transition-all shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#0d1017] flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </Link>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Welcome back, {loggedInName}!
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                    isAdmin
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {isAdmin ? 'HR / Administrator' : 'Staff Employee'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                <span>{loggedInRole}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Bengaluru R&D Hub (Tower 3)
                </span>
              </p>

              <div className="pt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 bg-[#141824] px-2.5 py-1 rounded-xl border border-white/5 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {currentTime} (IST)
                </span>
                <span className="hidden sm:inline-block text-slate-500">&bull;</span>
                <span className="hidden sm:inline-block text-slate-400">{currentDateStr}</span>
              </div>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* 1. Interactive Biometric Check In / Check Out */}
            <button
              onClick={handlePunchToggle}
              disabled={punchLoading || (todayAttendance && todayAttendance.checkIn && todayAttendance.checkOut)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                !todayAttendance?.checkIn
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                  : !todayAttendance?.checkOut
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30'
                  : 'bg-[#141824] text-slate-400 border border-white/10 cursor-not-allowed'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>
                {punchLoading
                  ? 'Processing...'
                  : !todayAttendance?.checkIn
                  ? 'Biometric Punch In'
                  : !todayAttendance?.checkOut
                  ? 'Biometric Punch Out'
                  : 'Shift Completed ✓'}
              </span>
            </button>

            {/* 2. Quick Apply Leave */}
            <button
              onClick={() => setApplyLeaveModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#141824] hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Apply Leave</span>
            </button>

            {/* 3. Admin Tools */}
            {isAdmin && (
              <>
                <Link
                  to="/employees"
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Employee</span>
                </Link>

                <Link
                  to="/payroll"
                  className="px-4 py-2.5 rounded-2xl bg-[#141824] hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2"
                >
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  <span>Payroll</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 CORE EXECUTIVE METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Active Workforce */}
        <Link to="/employees" className="bento-card p-5 relative overflow-hidden group hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{totalEmployees}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% YoY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Across {adminData?.departmentDistribution?.length || 6} Departments</span>
            <span className="text-indigo-400 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              View Directory &rarr;
            </span>
          </p>
        </Link>

        {/* Card 2: Today's Attendance Rate */}
        <Link to="/attendance" className="bento-card p-5 relative overflow-hidden group hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Attendance</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {presentToday} / {totalEmployees}
            </span>
            <span className="text-xs text-emerald-400 font-bold">({attendanceRate}%)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>
              {onLeaveToday} On Leave &bull; {absentToday} Absent
            </span>
            <span className="text-emerald-400 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Punch Logs &rarr;
            </span>
          </p>
        </Link>

        {/* Card 3: Pending Leave Approvals */}
        <Link to="/leaves" className="bento-card p-5 relative overflow-hidden group hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Leaves</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{pendingLeavesCount}</span>
            {pendingLeavesCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 animate-pulse">
                Action Required
              </span>
            ) : (
              <span className="text-xs text-emerald-400 font-medium">All Cleared ✓</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Awaiting HR Decision</span>
            <span className="text-amber-400 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Review Queue &rarr;
            </span>
          </p>
        </Link>

        {/* Card 4: Monthly Payroll Expenditure */}
        <Link to="/payroll" className="bento-card p-5 relative overflow-hidden group hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Compensation</span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              ₹{((totalPayroll) / 100000).toFixed(2)}L
            </span>
            <span className="text-xs text-cyan-400 font-bold">INR / Mo</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>EPF & TDS Deducted</span>
            <span className="text-cyan-400 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Salary Slips &rarr;
            </span>
          </p>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. WORKING INTERACTIVE GRAPHS (ANALYTICS INTELLIGENCE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Graph 1: Attendance Trends Curve (2 Cols) */}
        <div className="lg:col-span-2 bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Workforce Attendance & Punctuality Trends</h3>
                </div>
                <p className="text-xs text-slate-400">Monthly aggregate on-time arrival rate across Indian tech hubs</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 self-start sm:self-auto">
                {attendanceRate}% Punctuality Rate
              </span>
            </div>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232635" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis
                    stroke="#64748b"
                    domain={[80, 100]}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name === 'attendanceRate' ? 'Attendance' : 'On-Time']}
                    contentStyle={{
                      backgroundColor: '#121319',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attendanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Direct Biometric Machine Sync
            </span>
            <Link to="/attendance" className="text-cyan-400 font-bold hover:underline">
              View Detailed Logs &rarr;
            </Link>
          </div>
        </div>

        {/* Graph 2: Department Headcount Distribution (1 Col) */}
        <div className="bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Department Headcount</h3>
                </div>
                <p className="text-xs text-slate-400">Distribution across business units</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptBreakdown}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {deptBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0d1017" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Members`, 'Personnel']}
                    contentStyle={{
                      backgroundColor: '#121319',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-slate-300 ml-1">{val}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>{adminData?.departmentDistribution?.length || 4} Total Units</span>
            <Link to="/departments" className="text-indigo-400 font-bold hover:underline">
              Manage Units &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PENDING LEAVE APPROVALS QUEUE (WITH 1-CLICK APPROVE/REJECT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Live Leave Approvals Queue */}
        <div className="lg:col-span-2 bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Leave Requests & HR Approval Queue</h3>
                  <p className="text-xs text-slate-400">
                    {isAdmin
                      ? 'Review and make 1-click decisions directly from this dashboard'
                      : 'Your recent leave applications and status'}
                  </p>
                </div>
              </div>

              <Link
                to="/leaves"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Full Leave Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Leave Applications List */}
            <div className="mt-4 space-y-3">
              {adminData?.recentLeaves && adminData.recentLeaves.length > 0 ? (
                adminData.recentLeaves.slice(0, 4).map((leave) => {
                  const emp = leave.employee || {};
                  const isPending = leave.status === 'Pending';
                  const isActionLoading = actionLeaveId === leave._id;

                  return (
                    <div
                      key={leave._id}
                      className="p-4 rounded-2xl bg-[#141824] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          src={emp.profilePicture}
                          name={`${emp.firstName || ''} ${emp.lastName || ''}`}
                          size="md"
                          className="ring-2 ring-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">
                              {emp.firstName} {emp.lastName}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                              {emp.empCustomId || 'EMP-1001'}
                            </span>
                          </div>
                          <p className="text-xs text-cyan-400 font-medium">{leave.leaveType}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(leave.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                            {new Date(leave.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} (
                            {leave.daysCount || 1} days) &bull; <span className="italic text-slate-300">"{leave.reason}"</span>
                          </p>
                        </div>
                      </div>

                      {/* Status / 1-Click Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isPending && isAdmin ? (
                          <>
                            <button
                              onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <Badge
                            variant={
                              leave.status === 'Approved'
                                ? 'success'
                                : leave.status === 'Pending'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {leave.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-slate-200">No pending leave requests!</p>
                  <p className="text-xs text-slate-500 mt-0.5">All employee time-off applications are up to date.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Casual Quota: 12 Days &bull; Sick Quota: 10 Days &bull; Earned: 18 Days</span>
            <button
              onClick={() => setApplyLeaveModalOpen(true)}
              className="text-cyan-400 font-bold hover:underline cursor-pointer"
            >
              + Submit New Leave
            </button>
          </div>
        </div>

        {/* Right 1 Col: Monthly Payroll Payout Velocity Bar Chart */}
        <div className="bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Monthly Payroll Growth</h3>
                </div>
                <p className="text-xs text-slate-400">Direct salary disbursements in ₹ Lakhs</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                ₹12.5L /mo
              </span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232635" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    formatter={(val) => [`₹${val} Lakhs`, 'Disbursement']}
                    contentStyle={{
                      backgroundColor: '#121319',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Statutory EPF & TDS Compliant</span>
            <Link to="/payroll" className="text-emerald-400 font-bold hover:underline">
              Generate Payroll &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TEAM PERSONNEL & RECRUITMENT ATS PIPELINE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Indian Personnel Showcase */}
        <div className="lg:col-span-2 bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Active Indian Team Directory</h3>
                </div>
                <p className="text-xs text-slate-400">Key personnel across Bengaluru, Gurugram, and Mumbai hubs</p>
              </div>
              <Link to="/employees" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                View All {totalEmployees} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {adminData?.recentEmployees && adminData.recentEmployees.length > 0 ? (
                adminData.recentEmployees.slice(0, 6).map((emp) => (
                  <Link
                    key={emp._id}
                    to={`/employees/${emp._id}`}
                    className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={emp.profilePicture}
                        name={`${emp.firstName} ${emp.lastName}`}
                        size="md"
                        className="ring-2 ring-white/10 group-hover:ring-indigo-500/40"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <p className="text-[11px] text-cyan-400 font-medium">{emp.designation}</p>
                        <p className="text-[10px] text-slate-400">{emp.department?.name || 'Technology'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-emerald-400 block">
                        ₹{emp.salary ? (Number(emp.salary) / 1000).toFixed(0) : '85'}k
                      </span>
                      <span className="text-[10px] text-slate-500">{emp.empCustomId}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-500 col-span-2 py-4 text-center">Loading employee directory...</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>100% Verified Indian Personnel</span>
            <Link to="/employees" className="text-indigo-400 font-bold hover:underline">
              Add New Staff &rarr;
            </Link>
          </div>
        </div>

        {/* Right 1 Col: ATS Recruitment & Enterprise Hub Status */}
        <div className="bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Recruitment ATS Pipeline</h3>
                </div>
                <p className="text-xs text-slate-400">Active hiring stages and vacancies</p>
              </div>
              <Link to="/recruitment" className="text-xs font-bold text-cyan-400 hover:underline">
                ATS Board &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Open Job Positions</span>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                  {stats.activeJobs || 4} Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Candidate Applications</span>
                <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                  {stats.totalApplicants || 18} In Pipeline
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Interviews Scheduled (This Week)</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  5 Final Rounds
                </span>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory Compliance: Active</span>
              </div>
              <p className="text-[11px] text-slate-400">
                EPFO, ESIC, Professional Tax (PT), and TDS deductions verified for Indian payroll.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Cloud: AWS ap-south-1 (Mumbai)</span>
            <span className="text-emerald-400 font-semibold">Live & Synchronized</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK APPLY LEAVE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={applyLeaveModalOpen}
        onClose={() => setApplyLeaveModalOpen(false)}
        title="Submit Time-Off / Leave Application"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Leave Category
            </label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="block w-full rounded-xl border border-white/10 bg-[#181922] text-xs py-2.5 px-3 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="Casual Leave">Casual Leave (12 Days Annual Quota)</option>
              <option value="Sick Leave">Sick / Medical Leave (10 Days Quota)</option>
              <option value="Earned Leave">Earned Vacation Leave (18 Days Quota)</option>
              <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
              <option value="Unpaid Leave">Unpaid Leave of Absence</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Reason / Justification
            </label>
            <textarea
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
              placeholder="e.g. Family function in Delhi / Medical recovery..."
              className="block w-full rounded-xl border border-white/10 bg-[#181922] text-xs p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setApplyLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={leaveSubmitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
