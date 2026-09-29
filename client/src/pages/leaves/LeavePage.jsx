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
} from 'lucide-react';

const LeavePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

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

      await leaveApi.apply({
        ...applyForm,
        daysCount: days,
      });

      showToast('Leave request submitted', 'success');
      setApplyModalOpen(false);
      setApplyForm({
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit leave', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setAdminRemarks(action === 'Approved' ? 'Approved by HR.' : 'Cannot be approved.');
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
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

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
            <p className="text-[11px] text-slate-400 font-mono">{row.employee?.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      render: (row) => <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{row.leaveType}</span>,
    },
    {
      header: 'Period & Duration',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700 dark:text-slate-300">
            {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
          </p>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">
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
      header: 'Actions',
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
          <span className="text-xs text-slate-400">
            {row.adminRemarks || (row.status === 'Pending' ? 'Pending Review' : 'Processed')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Leave Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Apply for time off, monitor annual quota balances, and review leave workflows.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.slice(0, 3).map((bal, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {bal.leaveType}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{bal.remainingDays}</span>
                <span className="text-xs text-slate-400">/ {bal.totalQuota} days left</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {bal.usedDays} Used
            </span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {status === 'all' ? 'All Requests' : status}
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
        title="Apply for Leave"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Leave Type
            </label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm py-2 px-3 text-slate-900 dark:text-slate-100"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm p-3 text-slate-900 dark:text-slate-100 focus:outline-none"
              placeholder="Provide reason for time off request..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Submit Request
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
            You are setting this {selectedLeave?.leaveType} ({selectedLeave?.daysCount} days) for{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}
            </span>{' '}
            as <span className="font-semibold">{actionType}</span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Administrative Remarks
            </label>
            <textarea
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm p-3 text-slate-900 dark:text-slate-100 focus:outline-none"
              placeholder="Optional remarks for employee..."
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
