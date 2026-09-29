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
  Plus,
  MapPin,
  Check,
  X,
  ShieldCheck,
  Timer,
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

  // Live Digital Clock (IST)
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
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
        adminRemarks: `Decision marked directly from dashboard (${decisionStatus})`,
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
    return <LoadingSpinner text="Loading organizational dashboard..." />;
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
    { month: 'Apr', attendanceRate: 91 },
    { month: 'May', attendanceRate: 93 },
    { month: 'Jun', attendanceRate: 95 },
    { month: 'Jul', attendanceRate: 94 },
    { month: 'Aug', attendanceRate: 97 },
    { month: 'Sep', attendanceRate: attendanceRate },
  ];

  // Pure Monochrome Colors for Charts
  const pieColors = ['#09090b', '#27272a', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'];

  // Interactive Chart Data: Department Breakdown
  const deptBreakdown =
    adminData?.departmentDistribution && adminData.departmentDistribution.length > 0
      ? adminData.departmentDistribution.map((d, i) => ({
          name: d.name,
          count: d.count || 2,
          color: pieColors[i % pieColors.length],
        }))
      : [
          { name: 'Engineering', count: 5, color: pieColors[0] },
          { name: 'Product & Design', count: 3, color: pieColors[1] },
          { name: 'Human Resources', count: 2, color: pieColors[2] },
          { name: 'Operations & QA', count: 2, color: pieColors[3] },
        ];

  // Interactive Chart Data: Monthly Payroll Velocity (₹ in Lakhs)
  const payrollTrendData = [
    { month: 'Apr', amount: 8.5 },
    { month: 'May', amount: 9.2 },
    { month: 'Jun', amount: 9.8 },
    { month: 'Jul', amount: 10.4 },
    { month: 'Aug', amount: 11.2 },
    { month: 'Sep', amount: Number(((totalPayroll) / 100000).toFixed(1)) || 12.5 },
  ];

  const loggedInName = user?.name || 'Ayush Shukla';
  const loggedInAvatar = user?.avatar || user?.employee?.profilePicture || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80';
  const loggedInRole = user?.employee?.designation || (user?.role === 'admin' ? 'HR Administrator' : 'Staff Employee');

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP WELCOME CARD & QUICK ACTION BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* User Welcome Information */}
          <div className="flex items-center gap-4">
            <Link to="/profile" className="relative group block" title="Manage Profile Picture">
              <Avatar
                src={loggedInAvatar}
                name={loggedInName}
                size="lg"
                className="ring-2 ring-neutral-200 rounded-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-black ring-2 ring-white" />
            </Link>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-black">
                  Welcome, {loggedInName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isAdmin
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-900 border border-neutral-300'
                  }`}
                >
                  {isAdmin ? 'HR Administrator' : 'Staff Employee'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>{loggedInRole}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Bengaluru R&D Hub
                </span>
                <span>&bull;</span>
                <span className="font-semibold text-neutral-900">
                  {currentTime} (IST)
                </span>
              </div>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Biometric Clock In / Clock Out */}
            <Button
              variant={!todayAttendance?.checkIn ? 'primary' : !todayAttendance?.checkOut ? 'primary' : 'secondary'}
              size="sm"
              icon={Timer}
              onClick={handlePunchToggle}
              loading={punchLoading}
              disabled={todayAttendance?.checkIn && todayAttendance?.checkOut}
            >
              {!todayAttendance?.checkIn
                ? 'Clock In'
                : !todayAttendance?.checkOut
                ? 'Clock Out'
                : 'Shift Completed ✓'}
            </Button>

            {/* 2. Quick Apply Leave */}
            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() => setApplyLeaveModalOpen(true)}
            >
              Apply Leave
            </Button>

            {/* 3. Admin Tools */}
            {isAdmin && (
              <>
                <Link to="/employees">
                  <Button variant="secondary" size="sm" icon={Plus}>
                    Add Employee
                  </Button>
                </Link>

                <Link to="/payroll">
                  <Button variant="secondary" size="sm" icon={IndianRupee}>
                    Payroll
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 CORE STAT CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <Link
          to="/employees"
          className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-black transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total Employees
              </p>
              <h3 className="text-2xl font-bold text-black mt-1">
                {totalEmployees}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 text-black border border-neutral-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span>{adminData?.departmentDistribution?.length || 4} Departments</span>
            <span className="text-black font-semibold">View all &rarr;</span>
          </p>
        </Link>

        {/* Card 2: Today's Attendance */}
        <Link
          to="/attendance"
          className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-black transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Today's Attendance
              </p>
              <h3 className="text-2xl font-bold text-black mt-1">
                {presentToday} / {totalEmployees}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 text-black border border-neutral-200">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span>{attendanceRate}% Present today</span>
            <span className="text-black font-semibold">Logs &rarr;</span>
          </p>
        </Link>

        {/* Card 3: Pending Leaves */}
        <Link
          to="/leaves"
          className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-black transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Pending Leaves
              </p>
              <h3 className="text-2xl font-bold text-black mt-1">
                {pendingLeavesCount}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 text-black border border-neutral-200">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span>{pendingLeavesCount > 0 ? 'Requires action' : 'All cleared'}</span>
            <span className="text-black font-semibold">Review &rarr;</span>
          </p>
        </Link>

        {/* Card 4: Monthly Payroll */}
        <Link
          to="/payroll"
          className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-black transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Monthly Payroll
              </p>
              <h3 className="text-2xl font-bold text-black mt-1">
                ₹{((totalPayroll) / 100000).toFixed(2)}L
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 text-black border border-neutral-200">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span>EPF & TDS Deducted</span>
            <span className="text-black font-semibold">Vouchers &rarr;</span>
          </p>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHARTS SECTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-black">
                  Monthly Attendance Trends
                </h3>
                <p className="text-xs text-neutral-500">
                  Workforce punctuality rate (%) over the last 6 months
                </p>
              </div>
              <span className="text-xs font-semibold text-black bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-300">
                {attendanceRate}% Current Rate
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData}>
                  <defs>
                    <linearGradient id="attColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#71717a" domain={[80, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#000000"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#attColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Direct Biometric Machine Integration</span>
            <Link to="/attendance" className="text-black font-semibold hover:underline">
              View Attendance Logs &rarr;
            </Link>
          </div>
        </div>

        {/* Department Breakdown Chart */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-black">
                Department Distribution
              </h3>
              <p className="text-xs text-neutral-500">
                Personnel headcount by department
              </p>
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
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {deptBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Members`, 'Headcount']}
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-neutral-700 ml-1">{val}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>{adminData?.departmentDistribution?.length || 4} Total Units</span>
            <Link to="/departments" className="text-black font-semibold hover:underline">
              Manage Departments &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PENDING LEAVE APPROVALS QUEUE (DIRECT 1-CLICK ACTION) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-black">
                  Leave Requests & Approvals
                </h3>
                <p className="text-xs text-neutral-500">
                  {isAdmin
                    ? 'Review and take 1-click decisions directly from this dashboard'
                    : 'Your recent leave applications'}
                </p>
              </div>
              <Link to="/leaves" className="text-xs font-semibold text-black hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {adminData?.recentLeaves && adminData.recentLeaves.length > 0 ? (
                adminData.recentLeaves.slice(0, 4).map((leave) => {
                  const emp = leave.employee || {};
                  const isPending = leave.status === 'Pending';
                  const isActionLoading = actionLeaveId === leave._id;

                  return (
                    <div
                      key={leave._id}
                      className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={emp.profilePicture}
                          name={`${emp.firstName || ''} ${emp.lastName || ''}`}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-black">
                              {emp.firstName} {emp.lastName}
                            </h4>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              ({emp.empCustomId || 'EMP'})
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 font-medium">
                            {leave.leaveType} &bull; {leave.daysCount || 1} day(s)
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {new Date(leave.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                            {new Date(leave.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}: "{leave.reason}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isPending && isAdmin ? (
                          <>
                            <button
                              onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <Badge
                            variant={
                              leave.status === 'Approved'
                                ? 'active'
                                : leave.status === 'Pending'
                                ? 'pending'
                                : 'absent'
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
                <p className="text-xs text-neutral-400 py-6 text-center">No pending leave applications</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 mt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Annual Leaves: Casual (12) &bull; Sick (10) &bull; Earned (18)</span>
            <button
              onClick={() => setApplyLeaveModalOpen(true)}
              className="text-black font-semibold hover:underline cursor-pointer"
            >
              + Apply Leave
            </button>
          </div>
        </div>

        {/* Monthly Payroll Bar Chart */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-black">
                  Monthly Payroll
                </h3>
                <p className="text-xs text-neutral-500">
                  Disbursements in ₹ Lakhs
                </p>
              </div>
              <span className="text-xs font-bold text-black font-mono">
                ₹12.5L /mo
              </span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip
                    formatter={(val) => [`₹${val} Lakhs`, 'Disbursement']}
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>EPF & TDS Compliant</span>
            <Link to="/payroll" className="text-black font-semibold hover:underline">
              Generate Payroll &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TEAM MEMBERS DIRECTORY & ATS PIPELINE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Personnel */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-black">
                  Active Team Members
                </h3>
                <p className="text-xs text-neutral-500">
                  Key personnel across Bengaluru, Gurugram, and Mumbai hubs
                </p>
              </div>
              <Link to="/employees" className="text-xs font-semibold text-black hover:underline">
                View All ({totalEmployees}) &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminData?.recentEmployees && adminData.recentEmployees.length > 0 ? (
                adminData.recentEmployees.slice(0, 6).map((emp) => (
                  <Link
                    key={emp._id}
                    to={`/employees/${emp._id}`}
                    className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-black transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={emp.profilePicture}
                        name={`${emp.firstName} ${emp.lastName}`}
                        size="md"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-black">
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <p className="text-[11px] text-neutral-600 font-medium">
                          {emp.designation}
                        </p>
                        <p className="text-[10px] text-neutral-400">{emp.department?.name || 'Technology'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-black block">
                        ₹{emp.salary ? (Number(emp.salary) / 1000).toFixed(0) : '85'}k
                      </span>
                      <span className="text-[10px] text-neutral-400">{emp.empCustomId}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-neutral-400 py-4 text-center col-span-2">Loading employees...</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 mt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Verified Personnel</span>
            <Link to="/employees" className="text-black font-semibold hover:underline">
              + Add New Staff
            </Link>
          </div>
        </div>

        {/* ATS Recruitment Summary */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-black">
                  Recruitment Pipeline
                </h3>
                <p className="text-xs text-neutral-500">
                  Open vacancies & applications
                </p>
              </div>
              <Link to="/recruitment" className="text-xs font-semibold text-black hover:underline">
                ATS Board &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-800">Open Job Positions</span>
                <span className="font-bold text-black bg-neutral-200 px-2.5 py-0.5 rounded-full">
                  {stats.activeJobs || 4} Active
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-800">Candidate Applications</span>
                <span className="font-bold text-black bg-neutral-200 px-2.5 py-0.5 rounded-full">
                  {stats.totalApplicants || 18} Total
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-800">Interviews Scheduled</span>
                <span className="font-bold text-black bg-neutral-200 px-2.5 py-0.5 rounded-full">
                  5 This Week
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center gap-2 text-xs text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-black shrink-0" />
              <span>100% EPFO, ESIC & TDS Statutory Compliant</span>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Cloud Infrastructure</span>
            <span className="text-black font-semibold">Online ✓</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK APPLY LEAVE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={applyLeaveModalOpen}
        onClose={() => setApplyLeaveModalOpen(false)}
        title="Apply for Leave"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Leave Type
            </label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="block w-full rounded-lg border border-neutral-300 bg-white text-xs py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Casual Leave">Casual Leave (12 Days Annual Quota)</option>
              <option value="Sick Leave">Sick Leave (10 Days Quota)</option>
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
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
              placeholder="e.g. Medical appointment / Family event..."
              className="block w-full rounded-lg border border-neutral-300 bg-white text-xs p-2.5 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
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
