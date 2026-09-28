import React, { useState, useEffect } from 'react';
import { leaveApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
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

      showToast('Leave application submitted for approval', 'success');
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
    setAdminRemarks(action === 'Approved' ? 'Approved by HR.' : 'Cannot be approved due to project deadlines.');
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
          <img
            src={row.employee?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.employee?.firstName || 'user'}`}
            alt=""
            className="w-9 h-9 rounded-full object-cover bg-slate-100 ring-2 ring-indigo-500/20"
          />
          <div>
            <span className="font-bold text-slate-900">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <p className="text-xs text-slate-400 font-mono">{row.employee?.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs sm:text-sm">{row.leaveType}</span>
      ),
    },
    {
      header: 'Period & Duration',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-slate-700">
            {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
          </p>
          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] font-bold text-slate-600">
            {row.daysCount} Day(s)
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Action / Remarks',
      render: (row) => {
        if (isAdmin && row.status === 'Pending') {
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="success"
                size="sm"
                icon={Check}
                onClick={() => handleOpenReview(row, 'Approved')}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
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
            {row.adminRemarks || (row.status === 'Pending' ? 'Awaiting Review' : 'Processed')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Leave Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for leave, manage quotas, and review team time-off requests.
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

      {/* Leave Quota Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.slice(0, 3).map((bal, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {bal.leaveType}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{bal.remainingDays}</span>
                <span className="text-xs text-slate-400 font-medium">/ {bal.totalQuota} days left</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              {bal.usedDays} Used
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Leave Type
            </label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
            >
              <option value="Casual Leave">Casual Leave (Personal / Family)</option>
              <option value="Sick Leave">Sick Leave (Medical / Recovery)</option>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm p-3 focus:outline-none focus:border-indigo-500"
              placeholder="Please provide details regarding your leave request..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Application
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
          <p className="text-xs text-slate-600">
            You are about to mark this {selectedLeave?.leaveType} ({selectedLeave?.daysCount} days) for{' '}
            <span className="font-bold text-slate-900">
              {selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}
            </span>{' '}
            as <span className="font-bold">{actionType}</span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Admin Remarks / Note to Employee
            </label>
            <textarea
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm p-3 focus:outline-none focus:border-indigo-500"
              placeholder="Add optional remarks for the employee..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'Approved' ? 'success' : 'danger'}
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
