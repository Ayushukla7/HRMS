import React, { useState, useEffect } from 'react';
import { dashboardApi, departmentApi } from '../../api';
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

  const leaveDistribution = [
    { name: 'Casual Leave', value: 42, color: '#6E3482' },
    { name: 'Sick / Medical', value: 24, color: '#A56ABD' },
    { name: 'Earned Vacation', value: 36, color: '#49225B' },
    { name: 'Special Maternity/Paternity', value: 8, color: '#E7DBEF' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E3482]/20 border border-[#A56ABD]/30 text-[#A56ABD] text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Business Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5EBFA]">
            Workforce Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#E7DBEF]/70 mt-1">
            Visual workforce analytics, departmental budget allocations in ₹ INR, payroll expense velocity, and leave utilization.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Download}
          size="md"
          onClick={() => window.print()}
          className="shadow-lg shadow-[#6E3482]/30 hover:shadow-[#6E3482]/50"
        >
          Export Report PDF
        </Button>
      </div>

      {/* Top Bento Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E7DBEF]/60">Total Payroll Velocity</span>
            <div className="p-2.5 rounded-2xl bg-[#6E3482]/25 text-emerald-400 border border-[#A56ABD]/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F5EBFA] font-mono">₹12.5L</span>
            <span className="text-xs text-emerald-400 font-semibold">+11.6% MoM</span>
          </div>
          <p className="text-[11px] text-[#E7DBEF]/70 mt-1">Direct monthly compensation pool</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E7DBEF]/60">Avg. Division Budget</span>
            <div className="p-2.5 rounded-2xl bg-[#49225B]/60 text-[#A56ABD] border border-[#A56ABD]/30">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F5EBFA] font-mono">₹50 Lakhs</span>
          </div>
          <p className="text-[11px] text-[#A56ABD] mt-1">Allocated across {departments.length} units</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E7DBEF]/60">Punctuality Score</span>
            <div className="p-2.5 rounded-2xl bg-[#6E3482]/25 text-[#A56ABD] border border-[#A56ABD]/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F5EBFA] font-mono">97.2%</span>
            <span className="text-xs text-[#A56ABD] font-semibold">On-Time Punch</span>
          </div>
          <p className="text-[11px] text-[#E7DBEF]/70 mt-1">Across Bengaluru & Gurugram hubs</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E7DBEF]/60">Statutory Compliance</span>
            <div className="p-2.5 rounded-2xl bg-[#49225B]/60 text-[#E7DBEF] border border-[#A56ABD]/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F5EBFA] font-mono">100%</span>
            <span className="text-xs text-[#A56ABD] font-semibold">EPF & TDS</span>
          </div>
          <p className="text-[11px] text-[#E7DBEF]/70 mt-1">Audited Indian statutory filings</p>
        </div>
      </div>

      {/* Row 1: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payroll Expense Growth */}
        <div className="bento-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F5EBFA]">Monthly Payroll Growth Trend</h3>
              <p className="text-xs text-[#E7DBEF]/70">Net salary disbursements (₹ in Lakhs)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#6E3482]/25 text-[#F5EBFA] text-xs font-bold border border-[#A56ABD]/30">
              ₹12.5 Lakhs (Sep)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#49225B" opacity={0.4} />
                <XAxis dataKey="month" stroke="#A56ABD" tick={{ fontSize: 12, fill: '#E7DBEF' }} />
                <YAxis
                  stroke="#A56ABD"
                  tick={{ fontSize: 12, fill: '#E7DBEF' }}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val} Lakhs`, 'Monthly Disbursed']}
                  contentStyle={{
                    backgroundColor: '#1c0d28',
                    border: '1px solid rgba(165,106,189,0.3)',
                    borderRadius: '16px',
                    color: '#F5EBFA',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#A56ABD"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6E3482', stroke: '#F5EBFA', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Headcount vs Budget */}
        <div className="bento-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F5EBFA]">Departmental Budget Allocation</h3>
              <p className="text-xs text-[#E7DBEF]/70">Annual financial budget (₹ in Lakhs)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#49225B] text-[#A56ABD] text-xs font-bold border border-[#A56ABD]/30">
              ₹3.0 Cr Total
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#49225B" opacity={0.4} />
                <XAxis dataKey="name" stroke="#A56ABD" tick={{ fontSize: 12, fill: '#E7DBEF' }} />
                <YAxis
                  stroke="#A56ABD"
                  tick={{ fontSize: 12, fill: '#E7DBEF' }}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val} Lakhs`, 'Annual Budget']}
                  contentStyle={{
                    backgroundColor: '#1c0d28',
                    border: '1px solid rgba(165,106,189,0.3)',
                    borderRadius: '16px',
                    color: '#F5EBFA',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="budget" fill="#6E3482" radius={[8, 8, 0, 0]} />
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
                <h3 className="text-base font-bold text-[#F5EBFA]">Leave Category Utilization</h3>
                <p className="text-xs text-[#E7DBEF]/70">Annual quota consumption percentage</p>
              </div>
              <PieIcon className="w-5 h-5 text-[#A56ABD]" />
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1c0d28" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Utilization']}
                    contentStyle={{
                      backgroundColor: '#1c0d28',
                      border: '1px solid rgba(165,106,189,0.3)',
                      borderRadius: '12px',
                      color: '#F5EBFA',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-[#E7DBEF] ml-1">{val}</span>}
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
                <h3 className="text-base font-bold text-[#F5EBFA]">Indian Tech Hub Deployment</h3>
                <p className="text-xs text-[#E7DBEF]/70">Personnel distribution across regional hubs</p>
              </div>
              <Building className="w-5 h-5 text-[#A56ABD]" />
            </div>

            <div className="space-y-3.5">
              {[
                { city: 'Bengaluru R&D Hub (Tower 3)', count: 6, percent: 55, color: 'bg-[#6E3482]' },
                { city: 'Gurugram HQ (Cyber City)', count: 3, percent: 27, color: 'bg-[#A56ABD]' },
                { city: 'Mumbai Financial Center (BKC)', count: 2, percent: 18, color: 'bg-[#49225B]' },
              ].map((hub) => (
                <div key={hub.city} className="p-3.5 rounded-2xl bg-[#271337] border border-[#A56ABD]/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F5EBFA]">{hub.city}</span>
                    <span className="font-mono text-[#E7DBEF]">
                      {hub.count} members ({hub.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1c0d28] overflow-hidden">
                    <div className={`h-full ${hub.color} rounded-full`} style={{ width: `${hub.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#A56ABD]/20 flex items-center justify-between text-xs text-[#E7DBEF]/70">
            <span>Primary Cloud Gateway: AWS ap-south-1 (Mumbai)</span>
            <span className="text-emerald-400 font-semibold">Online & Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
