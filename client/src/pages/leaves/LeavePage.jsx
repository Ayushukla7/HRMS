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
      showToast(err.response?.data?.message || 'Failed to submit leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickReview = async (leaveId, status) => {
    try {
      const res = await leaveApi.updateStatus(leaveId, {
        status,
        adminRemarks: `Quick ${status} by HR Administrator`,
      });
      showToast(`Leave request ${status.toLowerCase()} successfully`, 'success');
      fetchData();
      if (fetchNotifications) fetchNotifications();
    } catch (err) {
      showToast('Failed to update leave status', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setReviewLoading(true);
    try {
      await leaveApi.updateStatus(selectedLeave._id, {
        status: actionType,
        adminRemarks,
      });
      showToast(`Leave request ${actionType.toLowerCase()} successfully`, 'success');
      setApprovalModalOpen(false);
      fetchData();
      if (fetchNotifications) fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update leave', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.employee?.profilePicture}
            name={`${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`}
            size="md"
            className="ring-1 ring-[#A56ABD]/40"
          />
          <div>
            <span className="font-bold text-[#F5EBFA] text-sm block">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <span className="text-xs text-[#A56ABD] font-mono">
              {row.employee?.empCustomId || 'EMP-ID'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Category',
      render: (row) => (
        <span className="font-semibold text-[#F5EBFA] text-xs sm:text-sm">{row.leaveType}</span>
      ),
    },
    {
      header: 'Schedule & Duration',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-[#E7DBEF] font-medium">
            {new Date(row.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} &rarr;{' '}
            {new Date(row.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <span className="font-mono text-xs font-bold text-[#A56ABD]">
            {row.daysCount || 1} {row.daysCount === 1 ? 'day' : 'days'}
          </span>
        </div>
      ),
    },
    {
      header: 'Applicant Reason',
      render: (row) => (
        <p className="text-xs text-[#E7DBEF]/80 max-w-xs truncate font-normal">
          {row.reason || 'Personal assignment'}
        </p>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Action',
      render: (row) => (
        <div>
          {isAdmin && row.status === 'Pending' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuickReview(row._id, 'Approved')}
                className="p-1.5 rounded-xl bg-[#6E3482] hover:bg-[#7f3d96] text-[#F5EBFA] text-xs font-bold transition-all shadow-xs"
                title="Approve Leave"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleQuickReview(row._id, 'Rejected')}
                className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all"
                title="Reject Leave"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-[#A56ABD] font-mono">Processed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E3482]/30 border border-[#A56ABD]/40 text-[#F5EBFA] text-xs font-semibold mb-2 shadow-xs">
            <CalendarDays className="w-3.5 h-3.5 text-[#A56ABD]" />
            <span>Time Off & Leave Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5EBFA]">
            Leave Quotas & HR Approvals
          </h1>
          <p className="text-xs sm:text-sm text-[#E7DBEF] mt-1">
            Apply for statutory leave, manage annual balances, and review pending employee requests in real time.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={() => setApplyModalOpen(true)}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Leave Quota Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'Casual Leave', total: 12, used: 4, color: '#A56ABD' },
          { type: 'Sick / Medical', total: 10, used: 2, color: '#6E3482' },
          { type: 'Earned Vacation', total: 18, used: 6, color: '#E7DBEF' },
          { type: 'Special Purpose', total: 5, used: 0, color: '#F5EBFA' },
        ].map((bal, idx) => {
          const remaining = bal.total - bal.used;
          const pct = Math.round((bal.used / bal.total) * 100);
          return (
            <div key={idx} className="bento-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A56ABD]">{bal.type}</span>
                <span className="text-xs font-mono font-bold text-[#F5EBFA]">
                  {remaining} / {bal.total} left
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#F5EBFA] font-mono">{remaining}</span>
                <span className="text-xs text-[#E7DBEF]">days available</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#271337] mt-3 overflow-hidden border border-[#A56ABD]/20">
                <div
                  className="h-full bg-gradient-to-r from-[#6E3482] to-[#A56ABD] rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Reviews Banner Card (for Admin) */}
      {isAdmin && pendingLeaves.length > 0 && (
        <div className="bento-card p-5 border border-[#A56ABD]/50 bg-gradient-to-r from-[#271337] via-[#1c0d28] to-[#271337] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#6E3482] text-[#F5EBFA]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5EBFA]">
                  Pending HR Approval Queue ({pendingLeaves.length})
                </h3>
                <p className="text-xs text-[#E7DBEF]">Review employee leave applications awaiting confirmation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingLeaves.map((leave) => (
              <div
                key={leave._id}
                className="p-3.5 rounded-2xl bg-[#271337] border border-[#A56ABD]/30 flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#F5EBFA] text-xs sm:text-sm">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </h4>
                    <p className="text-xs text-[#A56ABD] font-semibold">{leave.leaveType}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F5EBFA] bg-[#6E3482]/40 px-2 py-0.5 rounded-lg border border-[#A56ABD]/30">
                    {leave.daysCount || 1}d
                  </span>
                </div>

                <p className="text-xs text-[#E7DBEF]/80 line-clamp-1 italic font-normal">"{leave.reason}"</p>

                <div className="flex items-center gap-2 pt-2 border-t border-[#A56ABD]/20">
                  <Button
                    variant="primary"
                    size="xs"
                    icon={Check}
                    className="flex-1"
                    onClick={() => handleQuickReview(leave._id, 'Approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={X}
                    className="flex-1"
                    onClick={() => handleQuickReview(leave._id, 'Rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar Bento */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#E7DBEF] uppercase tracking-wider">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
          >
            <option value="all">All Leaves</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-[#E7DBEF] font-mono">
          Showing <span className="text-[#F5EBFA] font-bold">{leaves.length}</span> records
        </div>
      </div>

      {/* Leaves Table */}
      <DataTable
        columns={columns}
        data={leaves}
        loading={loading}
        emptyMessage="No leave records found"
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Employee Leave"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
              Leave Category
            </label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs py-2.5 px-3.5 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick / Medical Leave</option>
              <option value="Earned Leave">Earned Vacation Leave</option>
              <option value="Maternity Leave">Maternity / Paternity Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={applyForm.startDate}
              onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={applyForm.endDate}
              onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
              Reason / Justification
            </label>
            <textarea
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
              className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs p-3 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
              placeholder="e.g. Attending family wedding in Jaipur..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#A56ABD]/20">
            <Button variant="secondary" size="sm" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Submit to HR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeavePage;
