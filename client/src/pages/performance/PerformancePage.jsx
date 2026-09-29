import React, { useState, useEffect } from 'react';
import { performanceApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  TrendingUp,
  Award,
  Star,
  Plus,
  CheckCircle2,
  MessageSquare,
  Target,
  FileCheck,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const PerformancePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Comment Modal
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [employeeComments, setEmployeeComments] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [form, setForm] = useState({
    employeeId: '',
    reviewPeriod: 'Q2 2026 Annual Cycle',
    rating: 5,
    feedback: '',
    achievements: '',
    areasOfImprovement: '',
    goals: [
      { title: 'Deliver AI / Enterprise Platform Milestones', weightage: 50, progressPercent: 100 },
      { title: 'Technical Leadership, Code Reviews & Mentorship', weightage: 50, progressPercent: 95 },
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, empRes] = await Promise.all([
        performanceApi.getAll(),
        isAdmin ? employeeApi.getAll({ limit: 100 }) : Promise.resolve({ data: { success: true, data: [] } }),
      ]);

      if (revRes.data.success) setReviews(revRes.data.data);
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        if (empRes.data.data.length > 0 && !form.employeeId) {
          setForm((prev) => ({ ...prev, employeeId: empRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load performance appraisals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await performanceApi.create({
        employee: form.employeeId,
        reviewPeriod: form.reviewPeriod,
        rating: Number(form.rating),
        feedback: form.feedback,
        achievements: form.achievements,
        areasOfImprovement: form.areasOfImprovement,
        goals: form.goals,
      });

      showToast('Performance appraisal submitted successfully', 'success');
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit appraisal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;
    setCommentSubmitting(true);
    try {
      await performanceApi.addComments(selectedReview._id, { employeeComments });
      showToast('Acknowledgment and comments recorded', 'success');
      setCommentModalOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to record comment', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading performance evaluations..." />;
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : '4.9';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Talent Performance & Key Results</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Performance & OKR Appraisals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Goal tracking, quarterly performance scorecards, 360-degree feedback, and executive leadership ratings.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="md"
            onClick={() => setCreateModalOpen(true)}
            className="shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
          >
            Create Appraisal Review
          </Button>
        )}
      </div>

      {/* Top Bento Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Team Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{avgRating}</span>
            <span className="text-xs text-amber-400 font-semibold">/ 5.0 Rating</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" /> Top 5% Industry Talent Performance
          </p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OKR Delivery Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">94.8%</span>
            <span className="text-xs text-indigo-300 font-semibold">Milestones Hit</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High-velocity product sprint delivery</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Appraisals</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{reviews.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">Reviews Filed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% statutory cycle completion</p>
        </div>
      </div>

      {/* Reviews Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.length === 0 ? (
          <div className="col-span-2 bento-card p-12 text-center text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No performance evaluations recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Initiate a new appraisal cycle using the button above.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bento-card p-6 flex flex-col justify-between space-y-5 hover:border-white/[0.15] transition-all relative overflow-hidden"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={rev.employee?.profilePicture}
                      name={`${rev.employee?.firstName || ''} ${rev.employee?.lastName || ''}`}
                      size="lg"
                      className="ring-2 ring-white/10"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {rev.employee?.firstName} {rev.employee?.lastName}
                      </h3>
                      <p className="text-xs text-cyan-400 font-medium">
                        {rev.employee?.designation} &bull; {rev.employee?.department?.name || 'Engineering'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (rev.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold font-mono ml-1">{rev.rating || 5}.0</span>
                  </div>
                </div>

                {/* Review Cycle Badge */}
                <div className="mt-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#181922] border border-white/[0.06] text-[11px] font-semibold text-slate-300 font-mono">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {rev.reviewPeriod}
                  </span>
                </div>

                {/* Manager Feedback */}
                <div className="mt-4 p-4 rounded-2xl bg-[#181922] border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Manager Review & Key Achievements
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {rev.feedback || rev.achievements || 'Exemplary leadership, deep technical ownership, and rapid sprint execution.'}
                  </p>
                </div>

                {/* Goals Progress */}
                {rev.goals && rev.goals.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Target OKR Milestones
                    </span>
                    {rev.goals.map((goal, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-[#181922] border border-white/[0.04] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-200 font-medium truncate max-w-[220px]">{goal.title}</span>
                          <span className="font-mono font-bold text-cyan-400">{goal.progressPercent || 100}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${goal.progressPercent || 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Employee Response Note */}
                {rev.employeeComments && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                      Employee Acknowledgment:
                    </span>
                    <p className="text-slate-300 italic font-normal">"{rev.employeeComments}"</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Reviewed by: <strong className="text-slate-300">{rev.reviewer?.name || 'Chief Technology Officer'}</strong>
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  icon={MessageSquare}
                  onClick={() => {
                    setSelectedReview(rev);
                    setEmployeeComments(rev.employeeComments || '');
                    setCommentModalOpen(true);
                  }}
                  className="bg-[#181922] border-white/[0.08] text-slate-300 hover:text-white"
                >
                  {rev.employeeComments ? 'Edit Feedback' : 'Acknowledge & Sign'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Appraisal Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Performance Appraisal Record"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Indian Personnel
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
              className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs py-2.5 px-3 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.empCustomId}) - {e.designation}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Appraisal Cycle / Period"
              value={form.reviewPeriod}
              onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
              required
              placeholder="e.g. Q2 2026 Appraisal"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Overall Rating (1 - 5)
              </label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs py-2.5 px-3 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 - Outstanding Exceeds</option>
                <option value={4}>⭐⭐⭐⭐ 4 - Strong Performer</option>
                <option value={3}>⭐⭐⭐ 3 - Meets Expectations</option>
                <option value={2}>⭐⭐ 2 - Needs Guidance</option>
                <option value={1}>⭐ 1 - Unsatisfactory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Performance Feedback & Highlights
            </label>
            <textarea
              rows={3}
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              required
              className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs p-3 text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Key contributions, architecture ownership, collaboration..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Key Achievements & Delivered Deliverables
            </label>
            <textarea
              rows={2}
              value={form.achievements}
              onChange={(e) => setForm({ ...form, achievements: e.target.value })}
              className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs p-3 text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Led cloud migration with zero downtime..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Comments Modal */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Employee Appraisal Acknowledgment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Record employee feedback, mutual agreement, or performance discussion summary for this review period.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Employee Comments & Response
            </label>
            <textarea
              rows={4}
              value={employeeComments}
              onChange={(e) => setEmployeeComments(e.target.value)}
              required
              className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs p-3 text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Grateful for the mentorship. Looking forward to driving Q3 platform goals."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" onClick={() => setCommentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={commentSubmitting}>
              Save Acknowledgment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerformancePage;
