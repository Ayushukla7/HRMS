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
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Calendar,
  UserCheck,
  AlertCircle,
  Timer,
  Sparkles,
} from 'lucide-react';

const AttendancePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast, fetchNotifications } = useNotification();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );
  const [currentDateString, setCurrentDateString] = useState(
    new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  );

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('');
  const [locationPill, setLocationPill] = useState('Bengaluru R&D Hub');

  // Manual mark modal (admin)
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    workHours: 8,
    notes: 'Regular on-premise attendance',
    location: 'Bengaluru Tech Park',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
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
      const res = await attendanceApi.checkIn({ location: locationPill });
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

  // Metrics Calculation
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const totalHours = records.reduce((acc, r) => acc + (Number(r.workHours) || 0), 0);
  const avgHours = records.length > 0 ? (totalHours / records.length).toFixed(1) : '8.0';

  const columns = [
    {
      header: 'Employee Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.employee?.profilePicture}
            name={`${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`}
            size="md"
            className="ring-2 ring-neutral-200"
          />
          <div>
            <span className="font-bold text-neutral-900 text-sm block">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono tracking-wider">
              {row.employee?.empCustomId || 'EMP-ID'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Shift Date',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>{row.date}</span>
        </div>
      ),
    },
    {
      header: 'Punch In',
      render: (row) => (
        <span className="text-xs text-neutral-900 font-mono font-semibold bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 inline-block">
          {row.checkIn
            ? new Date(row.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '--:--'}
        </span>
      ),
    },
    {
      header: 'Punch Out',
      render: (row) => (
        <span className="text-xs text-neutral-900 font-mono font-semibold bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 inline-block">
          {row.checkOut
            ? new Date(row.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '--:--'}
        </span>
      ),
    },
    {
      header: 'Hours Logged',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            {row.workHours ? `${row.workHours} hrs` : '--'}
          </span>
        </div>
      ),
    },
    {
      header: 'Attendance Status',
      render: (row) => {
        const isPresent = row.status === 'Present';
        const isLate = row.status === 'Late';
        const isHalf = row.status === 'Half Day';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isPresent
                ? 'bg-black text-white border-black'
                : isLate
                ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                : isHalf
                ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                : 'bg-neutral-800 text-neutral-200 border-neutral-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPresent ? 'bg-white' : isLate ? 'bg-neutral-600' : isHalf ? 'bg-neutral-500' : 'bg-neutral-400'
              }`}
            />
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Location Hub',
      render: (row) => (
        <span className="text-xs text-neutral-600 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
          {row.location || 'Bengaluru R&D Hub'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-semibold mb-2">
            <Timer className="w-3.5 h-3.5" />
            <span>Biometric & Shift Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            Time & Attendance Tracker
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real-time biometric shift logging, automated working hours tracking, and geo-attendance.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="md"
            onClick={() => setManualModalOpen(true)}
          >
            Adjust / Log Attendance
          </Button>
        )}
      </div>

      {/* Main Hero Bento Grid: Live Punch Terminal + Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live Biometric Punch Terminal */}
        <div className="lg:col-span-2 bento-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Live Timekeeper</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold border border-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 animate-ping" />
                      IST +05:30
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono tracking-tight mt-0.5">
                    {currentTime}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-500 font-medium block">{currentDateString}</span>
                <span className="text-[11px] text-neutral-700 font-semibold flex items-center gap-1 justify-end mt-0.5">
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  {locationPill}
                </span>
              </div>
            </div>

            {/* Office Hub Selector Pill */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium mr-1">Active Hub:</span>
              {['Bengaluru R&D Hub', 'Gurugram HQ', 'Mumbai Financial Center', 'Remote / Work from Home'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationPill(loc)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    locationPill === loc
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button & Status Bar */}
          <div className="mt-6 pt-5 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  todayRecord?.checkIn && todayRecord?.checkOut
                    ? 'bg-neutral-900'
                    : todayRecord?.checkIn
                    ? 'bg-black animate-ping'
                    : 'bg-neutral-400'
                }`}
              />
              <span className="text-xs text-neutral-700">
                {todayRecord?.checkIn && todayRecord?.checkOut
                  ? `Today's Shift Logged: ${todayRecord.workHours || 8} Hours Completed`
                  : todayRecord?.checkIn
                  ? `Shift Active since ${new Date(todayRecord.checkIn).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}`
                  : 'No check-in recorded for today yet'}
              </span>
            </div>

            <div>
              {todayRecord?.checkIn && todayRecord?.checkOut ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-900 font-bold text-xs shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Shift Completed ({todayRecord.workHours || 8} hrs)</span>
                </div>
              ) : todayRecord?.checkIn ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={Clock}
                  loading={clockLoading}
                  onClick={handleClockOut}
                >
                  Punch Clock Out
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Clock}
                  loading={clockLoading}
                  onClick={handleClockIn}
                >
                  Punch Clock In Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Shift Quota & Metrics Mini-Bento */}
        <div className="bento-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Attendance Insights</h3>
              <Sparkles className="w-4 h-4 text-neutral-600" />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-neutral-200 text-neutral-900">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-neutral-700 font-medium">Present Rate</span>
                </div>
                <span className="text-sm font-bold text-neutral-900 font-mono">96.8%</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-neutral-200 text-neutral-900">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-neutral-700 font-medium">Avg. Shift Duration</span>
                </div>
                <span className="text-sm font-bold text-neutral-900 font-mono">{avgHours} hrs</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-neutral-200 text-neutral-900">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-neutral-700 font-medium">Late Punch Instances</span>
                </div>
                <span className="text-sm font-bold text-neutral-900 font-mono">{lateCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Shift Target: 40 hrs / wk</span>
            <span className="text-neutral-900 font-semibold">Policy Compliant</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Bento */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-neutral-900 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {isAdmin && employees.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Employee:</span>
              <select
                value={selectedEmpFilter}
                onChange={(e) => setSelectedEmpFilter(e.target.value)}
                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors max-w-xs"
              >
                <option value="">All Personnel</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.empCustomId})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Showing <span className="text-neutral-900 font-bold">{records.length}</span> recorded logs
        </div>
      </div>

      {/* Attendance Records Bento Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyMessage="No biometric attendance records found for this period"
      />

      {/* Manual Attendance Modal */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Log / Adjust Employee Attendance"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Select Employee
            </label>
            <select
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
              required
              className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs py-2.5 px-3 text-neutral-900 focus:outline-none focus:border-black"
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.empCustomId}) - {e.designation}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Shift Date"
            type="date"
            name="date"
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Attendance Status
            </label>
            <select
              value={manualForm.status}
              onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs py-2.5 px-3 text-neutral-900 focus:outline-none focus:border-black"
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
            label="Adjustment / Audit Notes"
            name="notes"
            value={manualForm.notes}
            onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            placeholder="e.g. Approved Client Onsite Assignment"
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200">
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
