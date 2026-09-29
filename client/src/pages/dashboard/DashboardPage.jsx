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

  // Interactive Checklist State matching screenshot
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Run A/B Testing for Interface Variants', time: '12:11', completed: true },
    { id: 2, title: 'Map User Flow for Registration Process', time: '15:41', inProgress: true, completed: false },
    { id: 3, title: 'Perform UX Audit of Existing Product', time: '16:54', completed: false },
    { id: 4, title: 'Validate Prototype Before MVP Launch', time: '17:11', completed: false },
    { id: 5, title: 'Design Onboarding Experience for Users', time: '18:09', completed: false },
  ]);

  // Salary data matching bar chart in screenshot
  const salaryData = [
    { month: 'Jan', amount: 900 },
    { month: 'Feb', amount: 1300 },
    { month: 'Mar', amount: 1100 },
    { month: 'Apr', amount: 800 },
    { month: 'May', amount: 1400 },
    { month: 'Jun', amount: 1600 },
    { month: 'Jul', amount: 1000 },
    { month: 'Aug', amount: 2000, highlight: true },
    { month: 'Sep', amount: 600 },
    { month: 'Oct', amount: 750 },
    { month: 'Nov', amount: 950 },
    { month: 'Dec', amount: 1150 },
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

  // Skills cloud tags matching screenshot
  const skillTags = [
    { name: 'Journey Map', top: '15%', left: '10%', rot: '-6deg' },
    { name: 'Responsive Design', top: '22%', right: '12%', rot: '4deg' },
    { name: 'Design System', top: '48%', left: '20%', rot: '0deg' },
    { name: 'User Experience', top: '42%', left: '46%', rot: '-45deg' },
    { name: 'User Flow', top: '48%', right: '14%', rot: '8deg' },
    { name: 'User Interface', top: '72%', left: '12%', rot: '2deg' },
    { name: 'Information Architecture', top: '78%', left: '32%', rot: '0deg' },
    { name: 'User Research', top: '68%', right: '16%', rot: '-4deg' },
  ];

  // Progress items list matching screenshot
  const progressItems = [
    { title: 'User Testing', hours: '10 hours', reward: '+$600', icon: TrendingUp },
    { title: 'Interviews', hours: '15 hours', reward: '+$900', icon: Sparkles },
    { title: 'A/B Testing', hours: '5 hours', reward: '+$340', icon: Layers },
    { title: 'Final Review', hours: '5 hours', reward: '+$300', icon: CheckCircle2 },
    { title: 'Design Iterations', hours: '20 hours', reward: '+$1200', icon: Compass },
    { title: 'Create a CJM & Architecture', hours: '20 hours', reward: '+$1200', icon: Zap },
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

  const featured = adminData?.featuredEmployee || {
    firstName: 'Aarav',
    lastName: 'Sharma',
    designation: 'UX/UI Lead & Architect',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    empCustomId: 'EMP-1001',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4-COLUMN BENTO GRID MATCHING THE REFERENCE DESIGN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* ========================================================= */}
        {/* COLUMN 1: HERO INDIAN EMPLOYEE CARD & SKILLS BENTO BUBBLE */}
        {/* ========================================================= */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Featured Profile Card */}
          <div className="bg-[#121319] rounded-3xl p-5 border border-white/[0.07] shadow-2xl relative overflow-hidden group">
            {/* Top Status Badges */}
            <div className="flex items-center justify-between z-10 relative mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 text-[11px] font-medium">
                1.2 years of work
              </span>
            </div>

            {/* Profile Image with subtle vignette */}
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-transparent to-[#121319]">
              <img
                src={featured.profilePicture}
                alt={`${featured.firstName} ${featured.lastName}`}
                className="w-full h-56 object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121319] via-transparent to-transparent opacity-80" />
            </div>

            {/* Name & Title with Arrow Link */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {featured.firstName} {featured.lastName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{featured.designation}</p>
              </div>
              <Link
                to="/employees"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="View Full Profile"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sub Stats Twin Cards: Days in Company & Done Projects */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#121319] rounded-2xl p-4 border border-white/[0.07]">
              <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">456</h4>
              <p className="text-[11px] text-slate-400 mt-1">Days in company</p>
            </div>
            <div className="bg-[#121319] rounded-2xl p-4 border border-white/[0.07]">
              <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">11</h4>
              <p className="text-[11px] text-slate-400 mt-1">Done projects</p>
            </div>
          </div>

          {/* Interactive Skills Cloud Floating Bento Bubble */}
          <div className="bg-[#121319] rounded-3xl p-5 border border-white/[0.07] h-48 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-3.5 right-3.5 text-slate-600 hover:text-slate-400 cursor-pointer">
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
                  className="px-2.5 py-1 rounded-full bg-[#1b1c24] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 text-[10px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-md select-none"
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
          <div className="bg-[#121319] rounded-3xl p-5 border border-white/[0.07] shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] mb-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Progress</h3>
              <button className="text-slate-500 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1 py-1">
              {progressItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.hours}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {item.reward}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Financials Bar Chart Card */}
          <div className="bg-[#121319] rounded-3xl p-5 border border-white/[0.07] shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Salary</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white">Jan-Dec $45,989</span>
                  <span className="text-[11px] font-semibold text-emerald-400">+12.00%</span>
                </div>
              </div>

              {/* Time Filter Pills */}
              <div className="flex items-center gap-1 bg-[#181922] p-1 rounded-full border border-white/10">
                {['7D', '1D', '1M', '1Y', 'All'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      timeFilter === t
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom High Contrast Bar Chart with Active Highlight */}
            <div className="h-36 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0f1015] border border-emerald-500/50 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xl">
                            <span className="text-emerald-400 font-mono">${payload[0].value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
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
                            fill={isHighlighted ? '#10b981' : '#22232d'}
                            rx={3}
                            className="transition-all duration-300 hover:fill-emerald-400"
                          />
                          {isHighlighted && (
                            <text
                              x={x + width / 2}
                              y={y - 5}
                              fill="#10b981"
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                            >
                              Aug $2000
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
          <div className="bg-[#121319] rounded-3xl p-5 border border-white/[0.07] shadow-xl h-full flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-white tracking-tight">Working format</h3>
              <button className="text-slate-500 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Multi-Ray Sunburst SVG Donut Gauge */}
            <div className="relative py-4 flex flex-col items-center justify-center my-auto">
              <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl animate-pulse-slow">
                {/* 60 radiating rays */}
                {[...Array(52)].map((_, i) => {
                  const angle = (i * 360) / 52;
                  const rad = (angle * Math.PI) / 180;
                  const rInner = 55;
                  const rOuter = 82;
                  const x1 = 100 + rInner * Math.cos(rad);
                  const y1 = 100 + rInner * Math.sin(rad);
                  const x2 = 100 + rOuter * Math.cos(rad);
                  const y2 = 100 + rOuter * Math.sin(rad);

                  let strokeColor = '#3f4354';
                  if (i < 30) strokeColor = '#10b981'; // Office 60%
                  else if (i < 46) strokeColor = '#06b6d4'; // Remote 32%
                  else strokeColor = '#f59e0b'; // Hybrid 8%

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Counter Badge at bottom-right of gauge */}
              <div className="absolute bottom-1 right-3 text-right">
                <p className="text-lg font-black text-white leading-none">456</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Days</p>
              </div>
            </div>

            {/* Breakdown Status Indicators with matching color pills */}
            <div className="space-y-2.5 pt-3 border-t border-white/[0.05] text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-300 font-medium">Hybrid</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono">
                  <span>2/5</span>
                  <span className="text-emerald-400 font-bold">08%</span>
                  <span className="text-slate-600">&bull;&bull;&bull;</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-300 font-medium">Remote</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono">
                  <span>3/4</span>
                  <span className="text-cyan-400 font-bold">32%</span>
                  <span className="text-slate-600">&bull;&bull;&bull;</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-300 font-medium">Office</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono">
                  <span>3/4</span>
                  <span className="text-amber-400 font-bold">60%</span>
                  <span className="text-slate-600">&bull;&bull;&bull;</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================= */}
        {/* COLUMN 4: TASK TIMELINE, MILESTONES & PRO CARD */}
        {/* ========================================================= */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Milestone Tasks & Timeline Card */}
          <div className="bg-[#121319] rounded-3xl p-5 border border-white/[0.07] shadow-xl flex-1 flex flex-col justify-between space-y-4">
            {/* Top Sparkline Finish Tasks */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">16/30</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Finish tasks</p>
                </div>
                <button className="text-slate-500 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Sparkline chart */}
              <div className="h-10 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stage 3 Circular Progress Meter */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="#262734" strokeWidth="3" fill="none" />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="#10b981"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * 23) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-white">23%</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Stage 3</span>
                <p className="text-xs font-semibold text-white leading-snug mt-0.5">
                  Develop UI Components Based on Design System
                </p>
              </div>
            </div>

            {/* Milestone Step Checklist Timeline */}
            <div className="space-y-3 pt-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    {task.completed ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-400 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : task.inProgress ? (
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-cyan-400/80 flex items-center justify-center text-cyan-300 text-[10px] font-bold mt-0.5">
                        &bull;&bull;
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-slate-400 mt-0.5" />
                    )}
                    <span
                      className={`text-xs leading-snug transition-colors ${
                        task.completed
                          ? 'text-slate-500 line-through'
                          : 'text-slate-200 group-hover:text-white font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap mt-0.5">
                    {task.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Drank / HR Pulse Premium Bento Card (Matching warm bronze box in image) */}
          <div className="bg-gradient-to-r from-[#2c1e17] via-[#241711] to-[#1a110d] rounded-3xl p-5 border border-[#c29b7f]/30 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              {/* Sunburst Iris Logo in Gold */}
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>

              {/* Action Pill */}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-amber-500/40 text-amber-200 text-xs font-bold transition-transform hover:scale-105">
                <span>&rarr;</span>
                <span>$12.99/month</span>
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-white tracking-tight">Drank Premium</h4>
              <p className="text-xs text-amber-200/60 mt-0.5">Automation, AI help &amp; more for pros</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
