import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, employeeApi, leaveApi, attendanceApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  Compass,
  Zap,
  DollarSign,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('1Y');

  // Interactive Checklist State matching reference design
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Run A/B Testing for Core Interface Variants', time: '12:11 PM', completed: true },
    { id: 2, title: 'Map User Flow for India Onboarding Experience', time: '03:41 PM', inProgress: true, completed: false },
    { id: 3, title: 'Perform UX & Biometric Shift Terminal Audit', time: '04:54 PM', completed: false },
    { id: 4, title: 'Validate Prototype Before Q3 Platform Release', time: '05:11 PM', completed: false },
    { id: 5, title: 'Design Onboarding System for Indian Tech Hubs', time: '06:09 PM', completed: false },
  ]);

  // Salary data matching bar chart in screenshot (₹ in Thousands)
  const salaryData = [
    { month: 'Jan', amount: 85 },
    { month: 'Feb', amount: 110 },
    { month: 'Mar', amount: 95 },
    { month: 'Apr', amount: 75 },
    { month: 'May', amount: 125 },
    { month: 'Jun', amount: 140 },
    { month: 'Jul', amount: 90 },
    { month: 'Aug', amount: 180, highlight: true },
    { month: 'Sep', amount: 85 },
    { month: 'Oct', amount: 95 },
    { month: 'Nov', amount: 105 },
    { month: 'Dec', amount: 120 },
  ];

  // Sparkline data for tasks
  const sparklineData = [
    { day: 5, count: 8 },
    { day: 10, count: 14 },
    { day: 15, count: 9 },
    { day: 20, count: 18 },
    { day: 25, count: 12 },
    { day: 30, count: 16 },
  ];

  // Skills cloud tags matching reference
  const skillTags = [
    { name: 'Journey Map', top: '12%', left: '10%', rot: '-5deg' },
    { name: 'Responsive Design', top: '18%', right: '10%', rot: '4deg' },
    { name: 'Design System', top: '44%', left: '16%', rot: '0deg' },
    { name: 'User Experience', top: '38%', left: '46%', rot: '-40deg' },
    { name: 'User Flow', top: '44%', right: '12%', rot: '7deg' },
    { name: 'User Interface', top: '70%', left: '10%', rot: '2deg' },
    { name: 'Information Architecture', top: '76%', left: '30%', rot: '0deg' },
    { name: 'User Research', top: '66%', right: '14%', rot: '-4deg' },
  ];

  // Progress items list matching screenshot
  const progressItems = [
    { title: 'User Experience Testing', hours: '10 hours', reward: '+₹45,000', icon: TrendingUp },
    { title: 'Stakeholder Interviews', hours: '15 hours', reward: '+₹65,000', icon: Sparkles },
    { title: 'A/B Testing & Analysis', hours: '5 hours', reward: '+₹25,000', icon: Layers },
    { title: 'Final Architectural Review', hours: '5 hours', reward: '+₹22,000', icon: CheckCircle2 },
    { title: 'Design Iterations', hours: '20 hours', reward: '+₹85,000', icon: Compass },
    { title: 'Create CJM & System Schema', hours: '20 hours', reward: '+₹85,000', icon: Zap },
  ];

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getAdminStats();
      if (res.data.success) {
        setAdminData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, inProgress: false } : t))
    );
  };

  if (loading) {
    return <LoadingSpinner text="Rendering Bento interface..." />;
  }

  // Dynamically resolve logged-in user profile details (shows the logged in person's photo & info!)
  const loggedInName = user?.name || 'Ayush Shukla';
  const loggedInAvatar =
    user?.avatar ||
    user?.employee?.profilePicture ||
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80';
  const loggedInRole =
    user?.employee?.designation || (user?.role === 'admin' ? 'HR Lead & Administrator' : 'Staff Specialist');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4-COLUMN BENTO GRID MATCHING THE REFERENCE DESIGN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* ========================================================= */}
        {/* COLUMN 1: HERO LOGGED-IN PROFILE CARD & SKILLS BENTO */}
        {/* ========================================================= */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Featured Profile Card - Always shows the currently logged in user! */}
          <div className="bento-card p-5 relative overflow-hidden group">
            {/* Top Status Badges */}
            <div className="flex items-center justify-between z-10 relative mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A56ABD]/20 border border-[#A56ABD]/50 text-[#F5EBFA] text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#A56ABD] animate-pulse" />
                ONLINE
              </span>
              <span className="px-3 py-1 rounded-full bg-[#271337] border border-[#A56ABD]/30 text-[#E7DBEF] text-xs font-medium">
                1.4 years of work
              </span>
            </div>

            {/* Profile Image with smooth vignette - Dynamic logged in photo! */}
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-transparent to-[#1c0d28]">
              <img
                src={loggedInAvatar}
                alt={loggedInName}
                className="w-full h-60 object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c0d28] via-transparent to-transparent opacity-80" />
            </div>

            {/* Name & Title with Profile Link */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-xl font-bold text-[#F5EBFA] tracking-tight font-sans">
                  {loggedInName}
                </h3>
                <p className="text-xs text-[#A56ABD] font-semibold mt-0.5">{loggedInRole}</p>
              </div>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-2xl bg-[#271337] hover:bg-[#6E3482] border border-[#A56ABD]/40 flex items-center justify-center text-[#E7DBEF] hover:text-[#F5EBFA] transition-all shadow-sm"
                title="Manage My Profile"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sub Stats Twin Cards: Days in Company & Done Projects */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bento-card p-4">
              <h4 className="text-3xl font-black text-[#F5EBFA] tracking-tight font-mono">456</h4>
              <p className="text-xs text-[#E7DBEF] mt-1 font-medium">Days in company</p>
            </div>
            <div className="bento-card p-4">
              <h4 className="text-3xl font-black text-[#F5EBFA] tracking-tight font-mono">11</h4>
              <p className="text-xs text-[#E7DBEF] mt-1 font-medium">Done projects</p>
            </div>
          </div>

          {/* Interactive Skills Cloud Floating Bento Bubble */}
          <div className="bento-card p-5 h-52 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-3.5 right-3.5 text-[#A56ABD] hover:text-[#F5EBFA] cursor-pointer">
              <ArrowUpRight className="w-4 h-4 rotate-90" />
            </div>

            {/* Floating Tags */}
            <div className="relative w-full h-full">
              {skillTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: tag.top,
                    left: tag.left,
                    right: tag.right,
                    transform: `rotate(${tag.rot})`,
                  }}
                  className="px-3 py-1 rounded-full bg-[#271337] hover:bg-[#6E3482] text-[#E7DBEF] hover:text-[#F5EBFA] border border-[#A56ABD]/35 hover:border-[#A56ABD] text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm select-none"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: PROGRESS LIST & SALARY FINANCIALS BAR CHART */}
        {/* ========================================================= */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Progress Activity Card */}
          <div className="bento-card p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#A56ABD]/20 mb-2">
              <h3 className="text-base font-bold text-[#F5EBFA] tracking-tight">Workstream Progress</h3>
              <button className="text-[#A56ABD] hover:text-[#F5EBFA]">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 flex-1 py-1">
              {progressItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#271337] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#271337] border border-[#A56ABD]/30 flex items-center justify-center text-[#A56ABD] shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#F5EBFA] leading-tight">{item.title}</p>
                        <p className="text-xs text-[#A56ABD] mt-0.5">{item.hours}</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-mono font-bold text-[#E7DBEF]">
                      {item.reward}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Financials Bar Chart Card */}
          <div className="bento-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A56ABD]">Disbursed Salary</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-black text-[#F5EBFA] font-mono">Jan-Dec ₹1.18 Cr</span>
                  <span className="text-xs font-bold text-[#A56ABD]">+14.2%</span>
                </div>
              </div>

              {/* Time Filter Pills */}
              <div className="flex items-center gap-1 bg-[#271337] p-1 rounded-full border border-[#A56ABD]/30">
                {['7D', '1D', '1M', '1Y', 'All'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                      timeFilter === t
                        ? 'bg-gradient-to-r from-[#6E3482] to-[#49225B] text-[#F5EBFA] border border-[#A56ABD]/50 shadow-sm'
                        : 'text-[#E7DBEF]/70 hover:text-[#F5EBFA]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom High Contrast Bar Chart with Active Highlight */}
            <div className="h-40 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#E7DBEF' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(165, 106, 189, 0.12)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1c0d28] border border-[#A56ABD] px-3 py-1.5 rounded-xl text-xs font-bold text-[#F5EBFA] shadow-2xl">
                            <span className="text-[#F5EBFA] font-mono">₹{payload[0].value},000</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[5, 5, 0, 0]}
                    shape={(props) => {
                      const { x, y, width, height, payload } = props;
                      const isHighlighted = payload.highlight;
                      return (
                        <g>
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={isHighlighted ? '#A56ABD' : '#49225B'}
                            rx={4}
                            className="transition-all duration-300 hover:fill-[#6E3482]"
                          />
                          {isHighlighted && (
                            <text
                              x={x + width / 2}
                              y={y - 6}
                              fill="#F5EBFA"
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="bold"
                            >
                              Aug ₹180k
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: WORKING FORMAT SUNBURST / RADIAL GAUGES */}
        {/* ========================================================= */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Working Format Card */}
          <div className="bento-card p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#A56ABD]/20">
              <h3 className="text-base font-bold text-[#F5EBFA] tracking-tight">Working format</h3>
              <button className="text-[#A56ABD] hover:text-[#F5EBFA]">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Multi-Ray Sunburst SVG Donut Gauge matching Uxintace 5-color palette */}
            <div className="relative py-5 flex flex-col items-center justify-center my-auto">
              <svg viewBox="0 0 200 200" className="w-52 h-52 drop-shadow-2xl animate-pulse-slow">
                {/* 52 radiating rays */}
                {[...Array(52)].map((_, i) => {
                  const angle = (i * 360) / 52;
                  const rad = (angle * Math.PI) / 180;
                  const rInner = 56;
                  const rOuter = 84;
                  const x1 = 100 + rInner * Math.cos(rad);
                  const y1 = 100 + rInner * Math.sin(rad);
                  const x2 = 100 + rOuter * Math.cos(rad);
                  const y2 = 100 + rOuter * Math.sin(rad);

                  let strokeColor = '#49225B';
                  if (i < 30) strokeColor = '#6E3482'; // Office 60% in Royal Purple
                  else if (i < 46) strokeColor = '#A56ABD'; // Remote 32% in Radiant Lavender
                  else strokeColor = '#E7DBEF'; // Hybrid 8% in Soft Lilac

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Counter Badge at bottom-right of gauge */}
              <div className="absolute bottom-1 right-3 text-right">
                <p className="text-2xl font-black text-[#F5EBFA] font-mono leading-none">456</p>
                <p className="text-xs text-[#A56ABD] font-semibold uppercase tracking-wider">Total Days</p>
              </div>
            </div>

            {/* Breakdown Status Indicators with matching Uxintace color pills */}
            <div className="space-y-2.5 pt-3 border-t border-[#A56ABD]/20 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#271337]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#6E3482] shadow-[0_0_8px_#6E3482]" />
                  <span className="text-[#E7DBEF] font-medium">In the office</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#A56ABD] font-mono">274 d</span>
                  <span className="font-bold text-[#F5EBFA] font-mono">60%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#271337]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#A56ABD] shadow-[0_0_8px_#A56ABD]" />
                  <span className="text-[#E7DBEF] font-medium">Remotely</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#A56ABD] font-mono">146 d</span>
                  <span className="font-bold text-[#F5EBFA] font-mono">32%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#271337]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#E7DBEF] shadow-[0_0_8px_#E7DBEF]" />
                  <span className="text-[#E7DBEF] font-medium">Hybrid Mode</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#A56ABD] font-mono">36 d</span>
                  <span className="font-bold text-[#F5EBFA] font-mono">8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 4: TASKS CHECKLIST & ENTERPRISE PLUM CARD */}
        {/* ========================================================= */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Tasks Checklist Card with Mini Sparkline Chart */}
          <div className="bento-card p-5 flex-1 flex flex-col justify-between">
            <div>
              {/* Header with Sparkline Line */}
              <div className="flex items-center justify-between pb-3 border-b border-[#A56ABD]/20">
                <div>
                  <h3 className="text-base font-bold text-[#F5EBFA] tracking-tight">Milestones</h3>
                  <p className="text-xs text-[#A56ABD] mt-0.5">8 completed this cycle</p>
                </div>
                <div className="w-20 h-9">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#A56ABD"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Checklist Items with Interactive Toggles */}
              <div className="space-y-2.5 mt-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border ${
                      task.completed
                        ? 'bg-[#271337]/40 border-[#A56ABD]/15 opacity-60'
                        : task.inProgress
                        ? 'bg-[#6E3482]/25 border-[#A56ABD]/50 shadow-xs'
                        : 'bg-[#271337] border-[#A56ABD]/25 hover:border-[#A56ABD]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          task.completed
                            ? 'bg-[#6E3482] border-[#A56ABD] text-[#F5EBFA]'
                            : task.inProgress
                            ? 'border-[#A56ABD] text-[#A56ABD]'
                            : 'border-[#A56ABD]/50 hover:border-[#A56ABD]'
                        }`}
                      >
                        {task.completed ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : task.inProgress ? (
                          <span className="w-2 h-2 rounded-full bg-[#A56ABD] animate-ping" />
                        ) : null}
                      </div>

                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-[#A56ABD]' : 'text-[#F5EBFA]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <span className="text-xs text-[#A56ABD] font-mono whitespace-nowrap">
                      {task.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#A56ABD]/20 flex items-center justify-between text-xs text-[#E7DBEF]">
              <span>Task Velocity: 98%</span>
              <span className="text-[#A56ABD] font-bold">On Schedule</span>
            </div>
          </div>

          {/* Imperial Plum Enterprise Card matching Uxintace Palette */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-[#49225B] via-[#6E3482] to-[#271337] border border-[#A56ABD]/40 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[170px]">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#A56ABD]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between z-10 relative">
              <span className="px-3 py-1 rounded-full bg-[#12071a]/50 border border-[#A56ABD]/40 text-[#F5EBFA] text-xs font-bold tracking-wider uppercase shadow-xs">
                Enterprise Hub
              </span>
              <Link
                to="/employees"
                className="w-8 h-8 rounded-full bg-[#12071a]/40 hover:bg-[#12071a]/70 border border-[#A56ABD]/40 flex items-center justify-center text-[#F5EBFA] hover:scale-110 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="z-10 relative mt-4">
              <h4 className="text-xl font-black text-[#F5EBFA] tracking-tight leading-tight">
                India Tech Ecosystem
              </h4>
              <p className="text-xs text-[#E7DBEF] mt-1 font-medium">
                100% compliant Indian payroll, biometric attendance & hiring pipeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
