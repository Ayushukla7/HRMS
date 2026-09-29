import React, { useState, useEffect } from 'react';
import { dashboardApi, departmentApi, leaveApi, payrollApi } from '../../api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CreditCard,
  Building,
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
    return <LoadingSpinner text="Compiling organizational reports & charts..." />;
  }

  const deptData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    budget: Math.round(d.budget / 1000),
    headcount: d.employeeCount || 0,
  }));

  const payrollTrend = [
    { month: 'Apr', amount: 48500 },
    { month: 'May', amount: 51200 },
    { month: 'Jun', amount: 53000 },
    { month: 'Jul', amount: 54800 },
    { month: 'Aug', amount: 56500 },
    { month: 'Sep', amount: 58200 },
  ];

  const leaveDistribution = [
    { name: 'Casual Leave', value: 42, color: '#2563eb' },
    { name: 'Sick Leave', value: 28, color: '#f59e0b' },
    { name: 'Earned Vacation', value: 35, color: '#10b981' },
    { name: 'Unpaid / Special', value: 8, color: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visual workforce analytics, departmental budget allocations, and compensation insights.
          </p>
        </div>

        <Button
          variant="outline"
          icon={Download}
          size="sm"
          onClick={() => window.print()}
        >
          Export Report PDF
        </Button>
      </div>

      {/* Row 1: Payroll Spend Trend & Department Headcounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payroll Expense Growth */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payroll Expenditure Trend</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total net salary disbursements ($ USD)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Total Disbursed']}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Headcount vs Budget */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Budgets ($k)</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Annual financial allocation per division</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}k`} />
                <Tooltip
                  formatter={(val) => [`$${val}k`, 'Annual Budget']}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="budget" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Distribution & Leave Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Pie */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Attendance Ratio</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Workforce status breakdown</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.attendanceSummary || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(dashboardData?.attendanceSummary || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Category Utilization */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Categories Utilized</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total days taken by leave classification</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
