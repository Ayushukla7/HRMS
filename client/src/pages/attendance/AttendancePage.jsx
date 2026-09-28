import React, { useState, useEffect } from 'react';
import { attendanceApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react';

const AttendancePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('');

  // Manual mark modal (admin)
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    workHours: 8,
    notes: 'Regular attendance',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (selectedEmpFilter) params.employeeId = selectedEmpFilter;

      const [attRes, todayRes, empRes] = await Promise.all([
        attendanceApi.getAll(params),
        attendanceApi.getToday(),
        isAdmin ? employeeApi.getAll({ limit: 100 }) : Promise.resolve({ data: { success: true, data: [] } }),
      ]);

      if (attRes.data.success) setRecords(attRes.data.data);
      if (todayRes.data.success) setTodayRecord(todayRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter, statusFilter, selectedEmpFilter]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await attendanceApi.checkIn({});
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await attendanceApi.checkOut({});
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualSubmitting(true);
    try {
      await attendanceApi.markManual(manualForm);
      showToast('Attendance record saved successfully', 'success');
      setManualModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update attendance', 'error');
    } finally {
      setManualSubmitting(false);
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
      header: 'Date',
      render: (row) => <span className="font-semibold text-slate-800">{row.date}</span>,
    },
    {
      header: 'Clock In',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.checkIn
            ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--'}
        </span>
      ),
    },
    {
      header: 'Clock Out',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.checkOut
            ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--'}
        </span>
      ),
    },
    {
      header: 'Work Hours',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 text-xs">
          {row.workHours ? `${row.workHours} hrs` : '--'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Location',
      render: (row) => (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          {row.location || 'Office'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Attendance Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time shift clocking, daily logs, work hour calculations, and attendance history.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => {
              setManualForm({
                employeeId: employees[0]?._id || '',
                date: new Date().toISOString().split('T')[0],
                status: 'Present',
                workHours: 8,
                notes: '',
              });
              setManualModalOpen(true);
            }}
          >
            Mark / Adjust Attendance
          </Button>
        )}
      </div>

      {/* Clock In / Out Banner Widget for Employee */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Attendance Punch</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {todayRecord?.checkIn && todayRecord?.checkOut ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Today's Shift Logged ({todayRecord.workHours} hrs)</span>
              </div>
            ) : todayRecord?.checkIn ? (
              <Button
                variant="danger"
                icon={Clock}
                loading={clockLoading}
                onClick={handleClockOut}
                className="shadow-lg shadow-rose-600/30"
              >
                Clock Out (In at {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </Button>
            ) : (
              <Button
                variant="success"
                icon={Clock}
                loading={clockLoading}
                onClick={handleClockIn}
                className="shadow-lg shadow-emerald-600/30"
              >
                Clock In Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-indigo-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="Leave">Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {isAdmin && employees.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Employee:</label>
            <select
              value={selectedEmpFilter}
              onChange={(e) => setSelectedEmpFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 max-w-xs"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.empCustomId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Attendance Records Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyMessage="No attendance records found"
      />

      {/* Manual Attendance Modal */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Manual Attendance Entry / Correction"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Employee
            </label>
            <select
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
              required
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.empCustomId})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            name="date"
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              value={manualForm.status}
              onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <Input
            label="Work Hours"
            type="number"
            step="0.5"
            name="workHours"
            value={manualForm.workHours}
            onChange={(e) => setManualForm({ ...manualForm, workHours: e.target.value })}
          />

          <Input
            label="Remarks / Notes"
            name="notes"
            value={manualForm.notes}
            onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            placeholder="e.g. Approved client-side visit"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={manualSubmitting}>
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
