import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authApi } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import {
  User,
  Lock,
  Mail,
  Upload,
  Camera,
  Trash2,
  KeyRound,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  Building2,
  MapPin,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfileState } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.avatar || user?.employee?.profilePicture || '');

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setAvatar(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile({
        name,
        avatar,
      });

      if (res.data.success) {
        updateProfileState(res.data.user);
        showToast('Profile and avatar updated instantly across dashboard!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setAvatar('');
    setImagePreview('');
    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile({
        name,
        avatar: '',
      });
      if (res.data.success) {
        updateProfileState(res.data.user);
        showToast('Profile photo removed', 'success');
      }
    } catch (err) {
      showToast('Failed to remove photo', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setPassLoading(true);
    try {
      const res = await authApi.updatePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      if (res.data.success) {
        showToast('Password updated successfully', 'success');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const currentDisplayAvatar = imagePreview || user?.avatar || user?.employee?.profilePicture;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Personal Account & Security Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Account Settings & Profile Photo
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update your profile picture (auto-syncs to hero dashboard and header), personal details, and account credentials.
        </p>
      </div>

      {/* Hero Profile Bento Card */}
      <div className="bento-card p-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative group">
          <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-indigo-500/30 shadow-2xl bg-[#181922] flex items-center justify-center">
            {currentDisplayAvatar ? (
              <img
                src={currentDisplayAvatar}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <User className="w-12 h-12 text-slate-500" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs font-bold gap-1 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Change Photo</span>
          </button>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
            <h2 className="text-xl font-black text-white">{user?.name}</h2>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold border inline-block ${
                user?.role === 'admin'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {user?.role === 'admin' ? 'HR / Administrator' : 'Staff Employee'}
            </span>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            {user?.email}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </button>

            {currentDisplayAvatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3.5 py-1.5 rounded-xl bg-[#181922] hover:bg-rose-500/10 text-rose-400 border border-white/[0.08] hover:border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Grid for Personal Info and Password Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal Details Form */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Information</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Ayush Shukla"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Work Email (Fixed)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="block w-full rounded-xl border border-white/[0.05] bg-[#181922]/50 text-xs py-2.5 px-3 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Direct Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => {
                  setAvatar(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs py-2.5 px-3 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={profileLoading}
              className="w-full justify-center shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 mt-2"
            >
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Security / Password Form */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security & Credentials</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              required
              placeholder="••••••••"
            />

            <Input
              label="New Password"
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              required
              placeholder="Minimum 6 characters"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              required
              placeholder="Repeat new password"
            />

            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={passLoading}
              className="w-full justify-center bg-[#181922] border-white/[0.08] text-white hover:bg-slate-800 mt-2"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
