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

      showToast(res.data.message || 'Leave request submitted and sent to HR for approval', 'success');
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
    setAdminRemarks(action === 'Approved' ? 'Approved by HR.' : 'Cannot be approved at this time.');
    setApprovalModalOpen(true);
  };

  const handleQuickDecision = async (leaveId, status) => {
    try {
      await leaveApi.updateStatus(leaveId, {
        status,
        adminRemarks: status === 'Approved' ? 'Approved by HR' : 'Rejected by HR',
      });
      showToast(`Leave request ${status.toLowerCase()}`, 'success');
      fetchData();
      if (fetchNotifications) fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update leave', 'error');
    }
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
        <div className="flex items-center gap-3">
          <Avatar
            src={row.employee?.profilePicture}
            name={`${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`}
            size="sm"
          />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{row.employee?.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.leaveType}</span>,
    },
    {
      header: 'Dates & Duration',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            {new Date(row.startDate).toLocaleDateString()} &ndash; {new Date(row.endDate).toLocaleDateString()}
          </p>
          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            {row.daysCount} Day(s)
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      render: (row) => (
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate" title={row.reason}>
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
            <div className="flex items-center gap-1.5">
              <Button
                variant="success"
                size="xs"
                icon={Check}
                onClick={() => handleOpenReview(row, 'Approved')}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="xs"
                icon={X}
                onClick={() => handleOpenReview(row, 'Rejected')}
              >
                Reject
              </Button>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.adminRemarks || (row.status === 'Pending' ? 'Pending HR Review' : 'Processed')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Leave Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit leave requests, review employee time-off applications, and monitor quota balances.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="sm"
          onClick={() => setApplyModalOpen(true)}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Quota Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((bal, idx) => {
          const percentUsed = Math.min(100, Math.round((bal.usedDays / bal.totalQuota) * 100));
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {bal.leaveType}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {bal.usedDays} Used
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{bal.remainingDays}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ {bal.totalQuota} days remaining</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      percentUsed > 80
                        ? 'bg-rose-500'
                        : percentUsed > 50
                        ? 'bg-amber-500'
                        : 'bg-blue-600 dark:bg-blue-500'
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
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Pending HR Approvals ({pendingLeavesList.length} Request{pendingLeavesList.length > 1 ? 's' : ''})</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Action required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingLeavesList.map((req) => (
              <div
                key={req._id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-amber-200/80 dark:border-amber-800/50 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={req.employee?.profilePicture}
                      name={`${req.employee?.firstName || ''} ${req.employee?.lastName || ''}`}
                      size="sm"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {req.employee?.firstName} {req.employee?.lastName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {req.employee?.designation} &bull; <span className="font-mono">{req.employee?.empCustomId}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="pending">{req.leaveType}</Badge>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded text-xs space-y-1">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {new Date(req.startDate).toLocaleDateString()} &ndash; {new Date(req.endDate).toLocaleDateString()} ({req.daysCount} Day{req.daysCount > 1 ? 's' : ''})
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">
                    &ldquo;{req.reason}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="danger"
                    size="xs"
                    icon={X}
                    onClick={() => handleOpenReview(req, 'Rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    size="xs"
                    icon={Check}
                    onClick={() => handleOpenReview(req, 'Approved')}
                  >
                    Approve Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {status === 'all' ? `All Requests (${leaves.length})` : `${status} (${leaves.filter(l => l.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Leave Table */}
      <DataTable
        columns={columns}
        data={leaves}
        loading={loading}
        emptyMessage="No leave requests found"
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Time Off"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Leave Classification
            </label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs py-2 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Reason for Request <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="State clear reason for absence (e.g. Medical recovery, Personal emergency, Family commitment)..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
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
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm decision for{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}
            </span>
            &rsquo;s {selectedLeave?.leaveType} ({selectedLeave?.daysCount} day{selectedLeave?.daysCount > 1 ? 's' : ''}):
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Administrative Remarks / Feedback
            </label>
            <textarea
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional remarks that will be delivered directly to the employee..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'Approved' ? 'success' : 'danger'}
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
