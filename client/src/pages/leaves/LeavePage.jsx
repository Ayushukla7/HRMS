import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

const LeavePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast, fetchNotifications } = useNotification();

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Approval Modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionType, setActionType] = useState('Approved');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const [leaveRes, balRes] = await Promise.all([
        leaveApi.getAll(params),
        leaveApi.getBalance(),
      ]);

      if (leaveRes.data.success) setLeaves(leaveRes.data.data);
      if (balRes.data.success) setBalances(balRes.data.data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const start = new Date(applyForm.startDate);
      const end = new Date(applyForm.endDate);
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const res = await leaveApi.apply({
        ...applyForm,
        daysCount: days,
      });

      showToast(res.data.message || 'Leave request submitted to HR for approval', 'success');
      setApplyModalOpen(false);
      setApplyForm({
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchData();
      if (fetchNotifications) fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit leave', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setAdminRemarks(action === 'Approved' ? 'Approved by HR Lead.' : 'Cannot be approved at this time.');
    setApprovalModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedLeave) return;
    setReviewLoading(true);
    try {
      await leaveApi.updateStatus(selectedLeave._id, {
        status: actionType,
        adminRemarks,
      });
      showToast(`Leave request ${actionType.toLowerCase()}`, 'success');
      setApprovalModalOpen(false);
      fetchData();
      if (fetchNotifications) fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingLeavesList = leaves.filter((l) => l.status === 'Pending');

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3.5">
          <Avatar
            src={row.employee?.profilePicture}
            name={`${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`}
            size="md"
          />
          <div>
            <span className="font-bold text-neutral-900 dark:text-white block text-sm">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <p className="text-[11px] text-neutral-500 dark:text-slate-500 font-mono mt-0.5">{row.employee?.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Classification',
      render: (row) => <span className="font-semibold text-neutral-800 dark:text-slate-200 text-xs sm:text-sm">{row.leaveType}</span>,
    },
    {
      header: 'Period & Days',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-neutral-700 dark:text-slate-300 font-medium">
            {new Date(row.startDate).toLocaleDateString()} &ndash; {new Date(row.endDate).toLocaleDateString()}
          </p>
          <span className="font-mono text-[11px] text-neutral-900 dark:text-emerald-400 font-bold">
            {row.daysCount} Day(s)
          </span>
        </div>
      ),
    },
    {
      header: 'Reason / Purpose',
      render: (row) => (
        <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Actions / Remarks',
      render: (row) => {
        if (isAdmin && row.status === 'Pending') {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenReview(row, 'Approved')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border dark:border-emerald-500/40 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleOpenReview(row, 'Rejected')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:border-rose-500/40 dark:text-rose-300 text-xs font-bold transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          );
        }
        return (
          <span className="text-xs text-neutral-500 dark:text-slate-400">
            {row.adminRemarks || (row.status === 'Pending' ? 'Under HR Review' : 'Processed')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Leave & Time-Off Desk
          </h1>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
            Submit leave requests, review employee time-off applications, and monitor quota balances.
          </p>
        </div>

        <button
          onClick={() => setApplyModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border dark:border-emerald-500/40 dark:text-emerald-300 text-xs font-bold shadow-sm dark:shadow-emerald-500/10 transition-all"
        >
          <Plus className="w-4 h-4 text-white dark:text-emerald-400" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Quota Balances Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((bal, idx) => {
          const percentUsed = Math.min(100, Math.round((bal.usedDays / bal.totalQuota) * 100));
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#121319] rounded-3xl p-5 border border-neutral-200 dark:border-white/[0.07] shadow-xs dark:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">
                    {bal.leaveType}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-700 dark:text-slate-400 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-white/10">
                    {bal.usedDays} Used
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{bal.remainingDays}</span>
                  <span className="text-xs text-neutral-500 dark:text-slate-500">/ {bal.totalQuota} days left</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-neutral-100 dark:bg-[#181922] h-2 rounded-full overflow-hidden p-0.5 border border-neutral-200 dark:border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentUsed > 80
                        ? 'bg-neutral-800 dark:bg-rose-500'
                        : percentUsed > 50
                        ? 'bg-neutral-600 dark:bg-amber-400'
                        : 'bg-black dark:bg-emerald-400'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HR Direct Approvals Panel (Shows when Admin has pending requests) */}
      {isAdmin && pendingLeavesList.length > 0 && (
        <div className="bg-neutral-50 dark:bg-[#191512] border border-neutral-200 dark:border-amber-500/30 rounded-3xl p-5 shadow-xs dark:shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-black dark:text-amber-400 animate-pulse" />
              <span>Pending HR Approvals ({pendingLeavesList.length} Action{pendingLeavesList.length > 1 ? 's' : ''} Required)</span>
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-amber-400/80 font-medium">1-Click Fast Approvals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLeavesList.map((req) => (
              <div
                key={req._id}
                className="bg-white dark:bg-[#121319] p-4 rounded-2xl border border-neutral-200 dark:border-amber-500/20 shadow-xs dark:shadow-xl flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={req.employee?.profilePicture}
                      name={`${req.employee?.firstName || ''} ${req.employee?.lastName || ''}`}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {req.employee?.firstName} {req.employee?.lastName}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-slate-400">
                        {req.employee?.designation} &bull; <span className="font-mono text-neutral-500 dark:text-slate-500">{req.employee?.empCustomId}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="pending">{req.leaveType}</Badge>
                </div>

                <div className="bg-neutral-50 dark:bg-[#181922] p-3 rounded-xl text-xs space-y-1 border border-neutral-200 dark:border-white/5">
                  <p className="text-neutral-900 dark:text-slate-200 font-semibold">
                    {new Date(req.startDate).toLocaleDateString()} &ndash; {new Date(req.endDate).toLocaleDateString()} ({req.daysCount} Day{req.daysCount > 1 ? 's' : ''})
                  </p>
                  <p className="text-neutral-600 dark:text-slate-400 italic text-[11px]">
                    &ldquo;{req.reason}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    onClick={() => handleOpenReview(req, 'Rejected')}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleOpenReview(req, 'Approved')}
                    className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border-emerald-500/40 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs Bento Pill */}
      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#121319] p-1.5 rounded-full border border-neutral-200 dark:border-white/[0.07] w-fit">
        {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              statusFilter === status
                ? 'bg-black text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/40 shadow-xs'
                : 'text-neutral-600 hover:text-black dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {status === 'all' ? `All Requests (${leaves.length})` : `${status} (${leaves.filter(l => l.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Leave Table Container */}
      <div className="bg-white dark:bg-[#121319] rounded-3xl border border-neutral-200 dark:border-white/[0.07] shadow-xs dark:shadow-xl overflow-hidden p-2">
        <DataTable
          columns={columns}
          data={leaves}
          loading={loading}
          emptyMessage="No leave requests found"
        />
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Time Off"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Leave Classification
            </label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="block w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#181922] text-xs py-2.5 px-3 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-500/50"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Earned Leave">Earned / Vacation Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={applyForm.startDate}
              onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={applyForm.endDate}
              onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Reason for Request <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
              className="block w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#181922] text-xs p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-500/50"
              placeholder="State reason for absence (e.g. Family festival, medical recovery, personal emergency)..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Submit to HR
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Approval Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title={`${actionType} Leave Request`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 dark:text-slate-300">
            Confirm decision for{' '}
            <span className="font-bold text-neutral-900 dark:text-white">
              {selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}
            </span>
            &rsquo;s {selectedLeave?.leaveType} ({selectedLeave?.daysCount} day{selectedLeave?.daysCount > 1 ? 's' : ''}):
          </p>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Administrative Remarks / Feedback
            </label>
            <textarea
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              className="block w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#181922] text-xs p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-500/50"
              placeholder="Optional remarks delivered directly to employee notification feed..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'Approved' ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleReviewSubmit}
              loading={reviewLoading}
            >
              Confirm {actionType}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeavePage;
