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
    reviewPeriod: 'Q2 2026',
    rating: 5,
    feedback: '',
    achievements: '',
    areasOfImprovement: '',
    goals: [
      { title: 'Deliver Sprint Milestones on time', weightage: 50, progressPercent: 100 },
      { title: 'Technical Leadership & Mentorship', weightage: 50, progressPercent: 90 },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Performance & Appraisals</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track goals, quarterly performance evaluations, employee ratings, and feedback reviews.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => setCreateModalOpen(true)}
          >
            Create Appraisal Review
          </Button>
        )}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-slate-900 p-12 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
            <Award className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No performance reviews recorded yet</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={rev.employee?.profilePicture}
                      name={`${rev.employee?.firstName || ''} ${rev.employee?.lastName || ''}`}
                      size="md"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rev.employee?.firstName} {rev.employee?.lastName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {rev.employee?.designation} • <span className="font-semibold text-blue-600 dark:text-blue-400">{rev.reviewPeriod}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rev.rating} / 5.0</span>
                  </div>
                </div>

                {/* Goals Progress */}
                {rev.goals && rev.goals.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Goals & Objectives
                    </span>
                    {rev.goals.map((g, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span>{g.title}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{g.progressPercent || 100}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-500"
                            style={{ width: `${g.progressPercent || 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] block">Reviewer Feedback</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{rev.feedback}</p>
                  </div>

                  {rev.achievements && (
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] block">Key Achievements</span>
                      <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed mt-0.5 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-100 dark:border-emerald-900/40">
                        {rev.achievements}
                      </p>
                    </div>
                  )}

                  {rev.employeeComments && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] block">Employee Response</span>
                      <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">"{rev.employeeComments}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500">
                  Reviewed by: <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.reviewer?.name || 'HR Team'}</span>
                </span>

                {!rev.employeeComments && (
                  <button
                    onClick={() => {
                      setSelectedReview(rev);
                      setEmployeeComments('');
                      setCommentModalOpen(true);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Acknowledge / Comment</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Appraisal Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Performance Appraisal"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Employee
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              label="Review Period"
              name="reviewPeriod"
              value={form.reviewPeriod}
              onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
              placeholder="Q2 2026 or Annual 2025"
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Rating
              </label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="5">5.0 - Outstanding / Exceptional</option>
                <option value="4.5">4.5 - Exceeds Expectations</option>
                <option value="4">4.0 - Meets High Standards</option>
                <option value="3.5">3.5 - Meets Standard Expectations</option>
                <option value="3">3.0 - Satisfactory</option>
                <option value="2">2.0 - Needs Improvement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Manager / HR Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Detailed constructive feedback on achievements and performance..."
            />
          </div>

          <Input
            label="Major Achievements"
            name="achievements"
            value={form.achievements}
            onChange={(e) => setForm({ ...form, achievements: e.target.value })}
            placeholder="e.g. Shipped new infrastructure migration on schedule"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Comment / Acknowledgment Modal */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Acknowledge Performance Review"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Add optional comments or reflections to acknowledge your appraisal score and feedback.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Your Comments
            </label>
            <textarea
              rows={3}
              value={employeeComments}
              onChange={(e) => setEmployeeComments(e.target.value)}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Thank you for the constructive feedback. Looking forward to achieving Q3 goals..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setCommentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={commentSubmitting}>
              Save Acknowledgment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerformancePage;
