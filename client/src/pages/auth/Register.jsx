import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { User, Mail, Lock, Shield, Sun, Moon, Sparkles, Building2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      showToast('Registration successful! Welcome to HR Pulse.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12071a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-[#F5EBFA] overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-[#6E3482]/20 via-[#49225B]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#A56ABD]/15 rounded-full blur-3xl pointer-events-none" />

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
        <h1 className="text-3xl font-black tracking-tight text-[#F5EBFA] font-sans">Create Account</h1>
        <p className="mt-1.5 text-xs text-[#E7DBEF]/70">Join the HR Pulse organizational portal</p>
      </div>

      {/* Auth Bento Box */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#1c0d28] border border-[#A56ABD]/25 p-8 shadow-2xl rounded-3xl backdrop-blur-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#E7DBEF]/80 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A56ABD]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] placeholder-[#E7DBEF]/40 focus:outline-none focus:border-[#A56ABD] transition-colors font-medium"
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="vikram.m@company.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] placeholder-[#E7DBEF]/40 focus:outline-none focus:border-[#A56ABD] transition-colors font-medium"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] placeholder-[#E7DBEF]/40 focus:outline-none focus:border-[#A56ABD] transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E7DBEF]/80 mb-1.5 uppercase tracking-wider">
                Account Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A56ABD]">
                  <Shield className="w-4 h-4" />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD] transition-colors font-medium"
                >
                  <option value="employee" className="bg-[#271337] text-[#F5EBFA]">Staff Employee Account</option>
                  <option value="admin" className="bg-[#271337] text-[#F5EBFA]">HR / Administrator Account</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full justify-center py-3 shadow-lg shadow-[#6E3482]/30 hover:shadow-[#6E3482]/50 mt-3 text-xs font-bold"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-[#E7DBEF]/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#A56ABD] hover:text-[#E7DBEF] hover:underline font-bold">
              Sign In Here
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

export default Register;
