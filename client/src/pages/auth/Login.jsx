import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authApi } from '../../api';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Logo from '../../components/common/Logo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@hrms.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Dynamic live demo personas state
  const [demoAccounts, setDemoAccounts] = useState([
    {
      name: 'Avinash Dev Dabas',
      role: 'HR Admin & Founder',
      email: 'admin@hrms.com',
      pass: 'admin123',
      badge: 'Admin',
      avatar: 'https://i.pinimg.com/736x/a9/e5/a2/a9e5a2d5aaa1f28338356244a195a0b2.jpg',
    },
    {
      name: 'Aarav Sharma',
      role: 'UX/UI Lead & Architect',
      email: 'aarav.sharma@hrms.com',
      pass: 'employee123',
      badge: 'Design',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Priya Patel',
      role: 'Principal Frontend Engineer',
      email: 'priya.patel@hrms.com',
      pass: 'employee123',
      badge: 'Tech',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rohan Verma',
      role: 'People Operations & Culture Lead',
      email: 'rohan.verma@hrms.com',
      pass: 'employee123',
      badge: 'HR Ops',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
  ]);

  // Fetch live personas from database on mount
  useEffect(() => {
    const fetchLivePersonas = async () => {
      try {
        const res = await authApi.getDemoPersonas();
        if (res.data?.success && res.data.data?.length > 0) {
          setDemoAccounts(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load dynamic demo personas, using defaults', err);
      }
    };
    fetchLivePersonas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back! Successfully signed in.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid email or password credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-neutral-900">
      <div className="w-full max-w-5xl bg-white border border-neutral-300 rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT PANEL: Enterprise Human Resource Showcase */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-neutral-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">HR Pulse</h2>
                <p className="text-[11px] text-neutral-400 font-mono tracking-wider uppercase">Human Resource Suite</p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>Modern People & Workforce OS</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Designed for Teams. Built for Impact.
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                Streamline employee shift attendance, biometric logs, statutory payroll disbursement, and performance reviews with high-contrast precision.
              </p>
            </div>

            {/* Team Showcase */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Active Organization Directory
              </p>
              <div className="space-y-2.5">
                {demoAccounts.slice(0, 4).map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleQuickLogin(acc.email, acc.pass)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={acc.avatar}
                        name={acc.name}
                        size="sm"
                        className="ring-1 ring-neutral-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-neutral-200">
                          {acc.name}
                        </span>
                        <span className="text-[11px] text-neutral-400">{acc.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-700 text-neutral-300">
                      {acc.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>&copy; 2026 HR Pulse Corp</span>
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" /> ISO 27001 & DPDP
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Sign-In Form */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <div className="lg:hidden flex items-center gap-3 mb-6">
                <Logo size="md" />
                <span className="text-lg font-black tracking-tight text-neutral-900">HR Pulse</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Account Sign In
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                Please enter your credentials to access the human resource dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@hrms.com"
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-xs text-neutral-400">Default: admin123 / employee123</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full justify-center py-3 text-sm font-bold shadow-xs mt-2"
                icon={ArrowRight}
              >
                Sign In to Workspace
              </Button>
            </form>

            {/* 1-Click Quick Demo Accounts Selector */}
            <div className="pt-5 border-t border-neutral-200">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Select Demo Persona to Sign In:</span>
                <span className="font-normal text-neutral-400">1-Click Auto Fill</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email, acc.pass)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      email === acc.email
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <Avatar
                      src={acc.avatar}
                      name={acc.name}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold leading-none truncate">{acc.name}</p>
                      <p className={`text-[10px] mt-0.5 truncate ${email === acc.email ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {acc.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center text-xs text-neutral-500 pt-2">
              Need a new enterprise account?{' '}
              <Link to="/register" className="text-black hover:underline font-bold">
                Register here
              </Link>
            </div>
          </div>

          {/* Legal Footer Links */}
          <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-center gap-4 text-xs text-neutral-400">
            <Link to="/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms-and-conditions" className="hover:text-black transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
