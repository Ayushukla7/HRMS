import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { Mail, Lock, ShieldCheck, UserCheck, Sun, Moon, Sparkles, Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@hrms.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back! Successfully authenticated.', 'success');
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
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-slate-100 overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2.5 rounded-2xl bg-[#121319] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white mb-4 shadow-xl shadow-indigo-600/25 ring-4 ring-white/[0.05]">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white font-sans">HR Pulse</h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Enterprise Human Resource & Workforce Management System
        </p>
      </div>

      {/* Auth Bento Box */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#121319] border border-white/[0.08] p-8 shadow-2xl rounded-3xl backdrop-blur-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#181922] border border-white/[0.08] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#181922] border border-white/[0.08] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full justify-center py-3 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 mt-3 text-xs font-bold"
            >
              Sign In to HR Pulse
            </Button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Indian Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hrms.com', 'admin123')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#181922] hover:bg-indigo-500/10 border border-white/[0.06] hover:border-indigo-500/30 text-xs font-bold text-slate-200 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin View</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('aarav.sharma@hrms.com', 'employee123')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#181922] hover:bg-cyan-500/10 border border-white/[0.06] hover:border-cyan-500/30 text-xs font-bold text-slate-200 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Staff View</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold">
              Register New Account
            </Link>
          </div>
        </div>

        {/* Footer legal links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/privacy-policy" className="hover:text-slate-300 hover:underline transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link to="/terms-and-conditions" className="hover:text-slate-300 hover:underline transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
