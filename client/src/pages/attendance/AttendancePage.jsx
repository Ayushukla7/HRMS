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
  Filter,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Timer,
  Sparkles,
  Zap,
  Building2,
  ChevronRight,
  ShieldAlert,
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
  const leaveCount = records.filter((r) => r.status === 'Leave' || r.status === 'Absent').length;
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
            className="ring-1 ring-[#A56ABD]/40"
          />
          <div>
            <span className="font-bold text-[#F5EBFA] text-sm block">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <span className="text-xs text-[#A56ABD] font-mono tracking-wider">
              {row.employee?.empCustomId || 'EMP-ID'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Shift Date',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#E7DBEF] font-medium">
          <Calendar className="w-4 h-4 text-[#A56ABD]" />
          <span>{row.date}</span>
        </div>
      ),
    },
    {
      header: 'Punch In',
      render: (row) => (
        <span className="text-xs text-[#F5EBFA] font-mono font-bold bg-[#6E3482]/40 px-2.5 py-1 rounded-xl border border-[#A56ABD]/40 inline-block shadow-xs">
          {row.checkIn
            ? new Date(row.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '--:--'}
        </span>
      ),
    },
    {
      header: 'Punch Out',
      render: (row) => (
        <span className="text-xs text-[#E7DBEF] font-mono font-bold bg-[#271337] px-2.5 py-1 rounded-xl border border-[#A56ABD]/30 inline-block">
          {row.checkOut
            ? new Date(row.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '--:--'}
        </span>
      ),
    },
    {
      header: 'Hours Logged',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#F5EBFA] bg-[#A56ABD]/20 px-2.5 py-1 rounded-xl border border-[#A56ABD]/40">
          {row.workHours ? `${row.workHours} hrs` : '--'}
        </span>
      ),
    },
    {
      header: 'Attendance Status',
      render: (row) => {
        const isPresent = row.status === 'Present';
        const isLate = row.status === 'Late';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isPresent
                ? 'bg-[#6E3482]/40 text-[#F5EBFA] border-[#A56ABD]/50'
                : isLate
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#271337] text-[#E7DBEF] border-[#A56ABD]/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPresent ? 'bg-[#A56ABD]' : isLate ? 'bg-amber-400' : 'bg-rose-400'
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
        <span className="text-xs text-[#E7DBEF] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#A56ABD]" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E3482]/30 border border-[#A56ABD]/40 text-[#F5EBFA] text-xs font-semibold mb-2 shadow-xs">
            <Timer className="w-3.5 h-3.5 text-[#A56ABD]" />
            <span>Biometric & Shift Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5EBFA]">
            Time & Attendance Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#E7DBEF] mt-1">
            Real-time biometric shift logging, automated working hours tracking, and Indian office geo-attendance.
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6E3482]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#49225B]/30 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#A56ABD]/20">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-[#271337] border border-[#A56ABD]/40 flex items-center justify-center text-[#F5EBFA] shadow-md">
                  <Clock className="w-6 h-6 text-[#A56ABD] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-[#A56ABD] tracking-wider">Live Timekeeper</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6E3482]/40 text-[#F5EBFA] text-[10px] font-bold border border-[#A56ABD]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A56ABD] animate-ping" />
                      IST +05:30
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#F5EBFA] font-mono tracking-tight mt-0.5">
                    {currentTime}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#E7DBEF] font-medium block">{currentDateString}</span>
                <span className="text-xs text-[#A56ABD] font-semibold flex items-center gap-1 justify-end mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {locationPill}
                </span>
              </div>
            </div>

            {/* Office Hub Selector Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#E7DBEF] font-semibold mr-1">Active Hub:</span>
              {['Bengaluru R&D Hub', 'Gurugram HQ', 'Mumbai Financial Center', 'Remote / Work from Home'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationPill(loc)}
                  className={`px-3 py-1 rounded-2xl text-xs font-semibold transition-all ${
                    locationPill === loc
                      ? 'bg-gradient-to-r from-[#6E3482] to-[#49225B] text-[#F5EBFA] border border-[#A56ABD] shadow-md'
                      : 'bg-[#271337] text-[#E7DBEF] hover:text-[#F5EBFA] border border-[#A56ABD]/20'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button & Status Bar */}
          <div className="mt-6 pt-5 border-t border-[#A56ABD]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  todayRecord?.checkIn && todayRecord?.checkOut
                    ? 'bg-[#A56ABD] shadow-[0_0_12px_#A56ABD]'
                    : todayRecord?.checkIn
                    ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-ping'
                    : 'bg-[#6E3482]'
                }`}
              />
              <span className="text-xs sm:text-sm text-[#E7DBEF]">
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
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#6E3482]/40 border border-[#A56ABD]/50 text-[#F5EBFA] font-bold text-xs shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-[#A56ABD]" />
                  <span>Shift Completed ({todayRecord.workHours || 8} hrs)</span>
                </div>
              ) : todayRecord?.checkIn ? (
                <Button
                  variant="danger"
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
              <h3 className="text-sm font-bold text-[#F5EBFA] uppercase tracking-wider">Attendance Insights</h3>
              <Sparkles className="w-4 h-4 text-[#A56ABD]" />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#271337] border border-[#A56ABD]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#6E3482]/40 text-[#F5EBFA]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#E7DBEF] font-medium">Present Rate</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-[#F5EBFA] font-mono">96.8%</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#271337] border border-[#A56ABD]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#6E3482]/40 text-[#F5EBFA]">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#E7DBEF] font-medium">Avg. Shift Duration</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-[#F5EBFA] font-mono">{avgHours} hrs</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#271337] border border-[#A56ABD]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#6E3482]/40 text-[#F5EBFA]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#E7DBEF] font-medium">Late Punch Instances</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-[#A56ABD] font-mono">{lateCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#A56ABD]/20 text-xs text-[#E7DBEF] flex items-center justify-between">
            <span>Shift Target: 40 hrs / wk</span>
            <span className="text-[#A56ABD] font-bold">Policy Compliant</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Bento */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E7DBEF] uppercase tracking-wider">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD] transition-colors"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-[#A56ABD] hover:text-[#F5EBFA] font-bold ml-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E7DBEF] uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD] transition-colors"
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
              <span className="text-xs font-bold text-[#E7DBEF] uppercase tracking-wider">Employee:</span>
              <select
                value={selectedEmpFilter}
                onChange={(e) => setSelectedEmpFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD] transition-colors max-w-xs"
              >
                <option value="">All Indian Personnel</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.empCustomId})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-[#E7DBEF] font-mono">
          Showing <span className="text-[#F5EBFA] font-bold">{records.length}</span> recorded logs
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
            <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
              Select Indian Employee
            </label>
            <select
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
              required
              className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs py-2.5 px-3.5 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
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
            <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
              Attendance Status
            </label>
            <select
              value={manualForm.status}
              onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs py-2.5 px-3.5 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
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

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#A56ABD]/20">
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
