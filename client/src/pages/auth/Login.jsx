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
    <div className="min-h-screen bg-[#12071a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-[#F5EBFA] overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-[#6E3482]/20 via-[#49225B]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#A56ABD]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2.5 rounded-2xl bg-[#1c0d28] border border-[#A56ABD]/25 text-[#E7DBEF]/70 hover:text-white transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#A56ABD]" />}
        </button>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#6E3482] via-[#A56ABD] to-[#49225B] text-white mb-4 shadow-xl shadow-[#6E3482]/30 ring-4 ring-[#A56ABD]/20">
          <Sparkles className="w-7 h-7 text-[#F5EBFA]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#F5EBFA] font-sans">HR Pulse</h1>
        <p className="mt-1.5 text-xs text-[#E7DBEF]/70">
          Enterprise Human Resource & Workforce Management System
        </p>
      </div>

      {/* Auth Bento Box */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#1c0d28] border border-[#A56ABD]/25 p-8 shadow-2xl rounded-3xl backdrop-blur-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#E7DBEF]/80 mb-1.5 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A56ABD]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] placeholder-[#E7DBEF]/40 focus:outline-none focus:border-[#A56ABD] transition-colors font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E7DBEF]/80 mb-1.5 uppercase tracking-wider">
                Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A56ABD]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] placeholder-[#E7DBEF]/40 focus:outline-none focus:border-[#A56ABD] transition-colors font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full justify-center py-3 shadow-lg shadow-[#6E3482]/30 hover:shadow-[#6E3482]/50 mt-3 text-xs font-bold"
            >
              Sign In to HR Pulse
            </Button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-6 pt-5 border-t border-[#A56ABD]/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#E7DBEF]/60 mb-3 text-center">
              Quick Indian Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hrms.com', 'admin123')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#271337] hover:bg-[#6E3482]/20 border border-[#A56ABD]/25 hover:border-[#A56ABD]/50 text-xs font-bold text-[#F5EBFA] transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#A56ABD]" />
                <span>Admin View</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('aarav.sharma@hrms.com', 'employee123')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#271337] hover:bg-[#6E3482]/20 border border-[#A56ABD]/25 hover:border-[#A56ABD]/50 text-xs font-bold text-[#F5EBFA] transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#A56ABD]" />
                <span>Staff View</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[#E7DBEF]/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#A56ABD] hover:text-[#E7DBEF] hover:underline font-bold">
              Register New Account
            </Link>
          </div>
        </div>

        {/* Footer legal links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[#E7DBEF]/60">
          <Link to="/privacy-policy" className="hover:text-[#F5EBFA] hover:underline transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link to="/terms-and-conditions" className="hover:text-[#F5EBFA] hover:underline transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
