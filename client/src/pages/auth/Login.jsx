import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import { Mail, Lock, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@hrms.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-neutral-900 font-sans">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white mb-3 shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Sign In to HR Pulse
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          Enterprise Human Resource & Workforce Management System
        </p>
      </div>

      {/* Auth Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs rounded-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black font-normal"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black font-normal"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full justify-center py-2.5 shadow-xs mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-[11px] font-semibold text-neutral-400 mb-2.5 text-center uppercase tracking-wider">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hrms.com', 'admin123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('aarav.sharma@hrms.com', 'employee123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-black" />
                <span>Staff Login</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-neutral-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-black hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </div>

        {/* Footer legal links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-neutral-400">
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
  );
};

export default Login;
