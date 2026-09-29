import React, { useState, useEffect } from 'react';
import { attendanceApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';

const AttendancePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast, fetchNotifications } = useNotification();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        if (empRes.data.data.length > 0 && !manualForm.employeeId) {
          setManualForm((prev) => ({ ...prev, employeeId: empRes.data.data[0]._id }));
        }
      }
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
        showToast('Successfully clocked in for your shift', 'success');
        fetchData();
        if (fetchNotifications) fetchNotifications();
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
        showToast('Successfully clocked out. Shift completed.', 'success');
        fetchData();
        if (fetchNotifications) fetchNotifications();
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
      header: 'Date',
      render: (row) => <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{row.date}</span>,
    },
    {
      header: 'Clock In',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {row.checkIn
            ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--'}
        </span>
      ),
    },
    {
      header: 'Clock Out',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {row.checkOut
            ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--'}
        </span>
      ),
    },
    {
      header: 'Logged Hours',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {row.workHours ? `${row.workHours} hrs` : '--'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Location / Device',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {row.location || 'Office Terminal'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Time & Attendance</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Shift clocking, work hour tracking, and historical attendance logs.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => {
              setManualModalOpen(true);
            }}
          >
            Adjust / Log Attendance
          </Button>
        )}
      </div>

      {/* Clock In / Out Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daily Shift Terminal</h3>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {currentTime}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div>
          {todayRecord?.checkIn && todayRecord?.checkOut ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>Shift Logged ({todayRecord.workHours} hrs)</span>
            </div>
          ) : todayRecord?.checkIn ? (
            <Button
              variant="danger"
              size="sm"
              icon={Clock}
              loading={clockLoading}
              onClick={handleClockOut}
            >
              Clock Out (Started at {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              icon={Clock}
              loading={clockLoading}
              onClick={handleClockIn}
            >
              Clock In Now
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Employee:</label>
            <select
              value={selectedEmpFilter}
              onChange={(e) => setSelectedEmpFilter(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-xs"
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
        title="Log / Adjust Attendance Record"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Employee
            </label>
            <select
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs py-2 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.empCustomId}) - {e.designation}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Attendance Date"
            type="date"
            name="date"
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Attendance Status
            </label>
            <select
              value={manualForm.status}
              onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs py-2 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <Input
            label="Logged Work Hours"
            type="number"
            step="0.5"
            name="workHours"
            value={manualForm.workHours}
            onChange={(e) => setManualForm({ ...manualForm, workHours: e.target.value })}
          />

          <Input
            label="Adjustment Notes"
            name="notes"
            value={manualForm.notes}
            onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            placeholder="e.g. Field assignment approval"
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={manualSubmitting}>
              Save Attendance Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
