import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, leaveApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Briefcase,
  UserPlus,
  ArrowRight,
  Check,
  X,
  Clock,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await dashboardApi.getAdminStats();
        if (res.data.success) {
          setAdminData(res.data.data);
        }
      } else {
        const res = await dashboardApi.getEmployeeStats();
        if (res.data.success) {
          setEmployeeData(res.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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
    return <LoadingSpinner text="Loading dashboard metrics..." />;
  }

  // ================= ADMIN DASHBOARD =================
  if (isAdmin && adminData) {
    const { stats, departmentDistribution, attendanceSummary, recentLeaves, recentApplications } = adminData;

    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Workforce Operations Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live organizational headcounts, attendance tracking, and administrative workflows.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/employees">
              <Button variant="outline" size="sm" icon={UserPlus}>
                Add Employee
              </Button>
            </Link>
            <Link to="/payroll">
              <Button variant="primary" size="sm" icon={CreditCard}>
                Run Payroll
              </Button>
            </Link>
          </div>
        </div>

        {/* Real KPI StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Active Workforce"
            value={stats.totalEmployees || 0}
            icon={Users}
            subtitle={`${stats.totalDepartments || 0} Active Departments`}
          />
          <StatCard
            title="Present Today"
            value={`${stats.presentToday || 0} / ${stats.totalEmployees || 0}`}
            icon={CalendarCheck}
            subtitle={`${stats.attendanceRate || 0}% attendance rate`}
          />
          <StatCard
            title="Pending Leave Requests"
            value={stats.pendingLeaves || 0}
            icon={CalendarDays}
            subtitle="Requires review"
          />
          <StatCard
            title="Active Job Openings"
            value={stats.activeJobs || 0}
            icon={Briefcase}
            subtitle={`${stats.totalApplicants || 0} Total Applicants`}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Headcount Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Headcount by Department
                </h3>
                <p className="text-xs text-slate-400">Active assigned personnel</p>
              </div>
              <Link to="/departments" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today Attendance Distribution */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Today Attendance Status
                </h3>
                <p className="text-xs text-slate-400">Shift status distribution</p>
              </div>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceSummary}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendanceSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Lists: Pending Leaves & Recent Candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Approvals */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Leave Approvals</h3>
              </div>
              <Link to="/leaves" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent leave requests</p>
              ) : (
                recentLeaves.slice(0, 4).map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={leave.employee?.profilePicture}
                        name={`${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`}
                        size="sm"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {leave.leaveType} &bull; {leave.daysCount} day(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {leave.status === 'Pending' ? (
                        <>
                          <Button
                            variant="success"
                            size="xs"
                            icon={Check}
                            onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            icon={X}
                            onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge variant={leave.status}>{leave.status}</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Job Applicants</h3>
              </div>
              <Link to="/recruitment" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View ATS
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentApplications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No applications received yet</p>
              ) : (
                recentApplications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{app.applicantName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.job?.title || 'Open Position'}</p>
                    </div>
                    <Badge variant={app.status}>{app.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= EMPLOYEE DASHBOARD =================
  if (employeeData) {
    const { employee, todayAttendance, attendanceSummary, pendingLeaves, recentLeaves, recentPayslips } = employeeData;

    return (
      <div className="space-y-6">
        {/* Employee Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={employee?.profilePicture || user?.avatar}
              name={`${employee?.firstName || user?.name || ''}`}
              size="lg"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {employee?.firstName || user?.name} {employee?.lastName || ''}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {employee?.designation} &bull; {employee?.department?.name || 'General'}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Employee ID: {employee?.empCustomId}
              </p>
            </div>
          </div>

          <Link to="/leaves">
            <Button variant="primary" size="sm" icon={CalendarDays}>
              Apply for Leave
            </Button>
          </Link>
        </div>

        {/* Real Personal StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Shift Status"
            value={
              todayAttendance?.checkIn && todayAttendance?.checkOut
                ? 'Completed'
                : todayAttendance?.checkIn
                ? 'Active'
                : 'Not Started'
            }
            icon={Clock}
            subtitle={todayAttendance?.checkIn ? `In: ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Shift starts 9:00 AM'}
          />
          <StatCard
            title="Days Present"
            value={`${attendanceSummary?.daysPresent || 0} Days`}
            icon={CalendarCheck}
            subtitle="Current billing cycle"
          />
          <StatCard
            title="Logged Work Hours"
            value={`${attendanceSummary?.totalHoursWorked || 0} hrs`}
            icon={Clock}
            subtitle="Recorded time"
          />
          <StatCard
            title="Pending Requests"
            value={pendingLeaves || 0}
            icon={CalendarDays}
            subtitle="Under HR review"
          />
        </div>

        {/* Employee Lists: Leaves & Payslips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">My Leave Applications</h3>
              <Link to="/leaves" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No leave applications found</p>
              ) : (
                recentLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{leave.leaveType}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.daysCount} days)
                      </p>
                    </div>
                    <Badge variant={leave.status}>{leave.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Payslips</h3>
              <Link to="/payroll" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentPayslips.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No payslip records yet</p>
              ) : (
                recentPayslips.map((pay) => (
                  <div
                    key={pay._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {pay.month} {pay.year}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Net Pay: ${pay.netSalary?.toLocaleString()}</p>
                    </div>
                    <Badge variant={pay.paymentStatus}>{pay.paymentStatus}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-slate-400">
      <p>Unable to load dashboard records.</p>
    </div>
  );
};

export default DashboardPage;
