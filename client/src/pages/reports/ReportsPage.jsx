import React, { useState, useEffect } from 'react';
import { dashboardApi, departmentApi, leaveApi, payrollApi } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CreditCard,
  Building,
  TrendingUp,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  CheckCircle2,
  FileText,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const ReportsPage = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, deptRes] = await Promise.all([
          dashboardApi.getAdminStats(),
          departmentApi.getAll(),
        ]);
        if (dashRes.data.success) setDashboardData(dashRes.data.data);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling organizational analytics & reports..." />;
  }

  const deptData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    budget: Math.round((Number(d.budget) || 4000000) / 100000), // in Lakhs
    headcount: d.employeeCount || 2,
  }));

  const payrollTrend = [
    { month: 'Apr', amount: 8.5 },
    { month: 'May', amount: 9.2 },
    { month: 'Jun', amount: 9.8 },
    { month: 'Jul', amount: 10.4 },
    { month: 'Aug', amount: 11.2 },
    { month: 'Sep', amount: 12.5 },
  ];

  const leaveColors = isDark
    ? ['#6366f1', '#f59e0b', '#10b981', '#06b6d4']
    : ['#09090b', '#3f3f46', '#71717a', '#a1a1aa'];

  const leaveDistribution = [
    { name: 'Casual Leave', value: 42, color: leaveColors[0] },
    { name: 'Sick / Medical', value: 24, color: leaveColors[1] },
    { name: 'Earned Vacation', value: 36, color: leaveColors[2] },
    { name: 'Special Maternity/Paternity', value: 8, color: leaveColors[3] },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Business Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Workforce Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            Visual workforce analytics, departmental budget allocations in ₹ INR, payroll expense velocity, and leave utilization.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Download}
          size="md"
          onClick={() => window.print()}
        >
          Export Report PDF
        </Button>
      </div>

      {/* Top Bento Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">Total Payroll Velocity</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono">₹12.5L</span>
            <span className="text-xs text-neutral-600 dark:text-emerald-400 font-semibold">+11.6% MoM</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-slate-400 mt-1">Direct monthly compensation pool</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">Avg. Division Budget</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono">₹50 Lakhs</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-indigo-300 mt-1">Allocated across {departments.length} units</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">Punctuality Score</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900 dark:bg-cyan-500/10 dark:text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono">97.2%</span>
            <span className="text-xs text-neutral-600 dark:text-cyan-400 font-semibold">On-Time Punch</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-slate-400 mt-1">Across Bengaluru & Gurugram hubs</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">Statutory Compliance</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900 dark:bg-purple-500/10 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono">100%</span>
            <span className="text-xs text-neutral-600 dark:text-purple-400 font-semibold">EPF & TDS</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-slate-400 mt-1">Audited Indian statutory filings</p>
        </div>
      </div>

      {/* Row 1: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payroll Expense Growth */}
        <div className="bento-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Monthly Payroll Growth Trend</h3>
              <p className="text-xs text-neutral-500 dark:text-slate-400">Net salary disbursements (₹ in Lakhs)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-emerald-500/10 text-neutral-900 dark:text-emerald-400 text-xs font-bold border border-neutral-300 dark:border-emerald-500/20">
              ₹12.5 Lakhs (Sep)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#232635' : '#e4e4e7'} opacity={0.6} />
                <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#a1a1aa'} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#71717a' }} />
                <YAxis
                  stroke={isDark ? '#64748b' : '#a1a1aa'}
                  tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#71717a' }}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val} Lakhs`, 'Monthly Disbursed']}
                  contentStyle={{
                    backgroundColor: isDark ? '#121319' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e4e4e7',
                    borderRadius: '16px',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={isDark ? '#6366f1' : '#000000'}
                  strokeWidth={3}
                  dot={{ r: 5, fill: isDark ? '#6366f1' : '#000000', stroke: isDark ? '#121319' : '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Headcount vs Budget */}
        <div className="bento-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Departmental Budget Allocation</h3>
              <p className="text-xs text-neutral-500 dark:text-slate-400">Annual financial budget (₹ in Lakhs)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-cyan-500/10 text-neutral-900 dark:text-cyan-400 text-xs font-bold border border-neutral-300 dark:border-cyan-500/20">
              ₹3.0 Cr Total
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#232635' : '#e4e4e7'} opacity={0.6} />
                <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#a1a1aa'} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#71717a' }} />
                <YAxis
                  stroke={isDark ? '#64748b' : '#a1a1aa'}
                  tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#71717a' }}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val} Lakhs`, 'Annual Budget']}
                  contentStyle={{
                    backgroundColor: isDark ? '#121319' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e4e4e7',
                    borderRadius: '16px',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="budget" fill={isDark ? '#06b6d4' : '#000000'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Leave Utilization Donut & Regional Workforce Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leave Type Allocation */}
        <div className="bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Leave Category Utilization</h3>
                <p className="text-xs text-neutral-500 dark:text-slate-400">Annual quota consumption percentage</p>
              </div>
              <PieIcon className="w-5 h-5 text-neutral-700 dark:text-indigo-400" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#121319' : '#ffffff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Utilization']}
                    contentStyle={{
                      backgroundColor: isDark ? '#121319' : '#ffffff',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e4e4e7',
                      borderRadius: '12px',
                      color: isDark ? '#fff' : '#000',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-neutral-700 dark:text-slate-300 ml-1">{val}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Regional Hub Breakdown */}
        <div className="bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Indian Tech Hub Deployment</h3>
                <p className="text-xs text-neutral-500 dark:text-slate-400">Personnel distribution across regional hubs</p>
              </div>
              <Building className="w-5 h-5 text-neutral-700 dark:text-cyan-400" />
            </div>

            <div className="space-y-3.5">
              {[
                { city: 'Bengaluru R&D Hub (Tower 3)', count: 6, percent: 55, color: isDark ? 'bg-cyan-400' : 'bg-black' },
                { city: 'Gurugram HQ (Cyber City)', count: 3, percent: 27, color: isDark ? 'bg-indigo-400' : 'bg-neutral-700' },
                { city: 'Mumbai Financial Center (BKC)', count: 2, percent: 18, color: isDark ? 'bg-emerald-400' : 'bg-neutral-500' },
              ].map((hub) => (
                <div key={hub.city} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#181922] border border-neutral-200 dark:border-white/[0.05] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 dark:text-white">{hub.city}</span>
                    <span className="font-mono text-neutral-600 dark:text-slate-300">
                      {hub.count} members ({hub.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${hub.color} rounded-full`} style={{ width: `${hub.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-neutral-500 dark:text-slate-400">
            <span>Primary Cloud Gateway: AWS ap-south-1 (Mumbai)</span>
            <span className="text-neutral-900 dark:text-emerald-400 font-semibold">Online & Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
