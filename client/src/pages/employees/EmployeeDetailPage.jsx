import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeApi, attendanceApi, leaveApi, payrollApi, performanceApi } from '../../api';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchAllDetails = async () => {
      setLoading(true);
      try {
        const empRes = await employeeApi.getById(id);
        if (empRes.data.success) {
          setEmployee(empRes.data.data);
        }

        const [attRes, leaveRes, payRes, perfRes] = await Promise.all([
          attendanceApi.getAll({ employeeId: id }),
          leaveApi.getAll({ employeeId: id }),
          payrollApi.getAll({ employeeId: id }),
          performanceApi.getEmployeeReviews(id),
        ]);

        if (attRes.data.success) setAttendance(attRes.data.data);
        if (leaveRes.data.success) setLeaves(leaveRes.data.data);
        if (payRes.data.success) setPayrolls(payRes.data.data);
        if (perfRes.data.success) setReviews(perfRes.data.data);
      } catch (err) {
        console.error('Failed to load employee details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading employee dossier..." />;
  }

  if (!employee) {
    return (
      <div className="p-12 text-center bento-card">
        <p className="text-neutral-400 mb-4 font-semibold">Employee record not found.</p>
        <Link to="/employees">
          <Button variant="primary" size="sm">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/employees"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Personnel Directory</span>
      </Link>

      {/* Hero Dossier Card */}
      <div className="bento-card p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar
                src={employee.profilePicture}
                name={`${employee.firstName} ${employee.lastName}`}
                size="2xl"
                className="w-24 h-24 ring-4 ring-neutral-200 rounded-3xl"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black ring-2 ring-white" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-neutral-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                    employee.status === 'Active'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                  }`}
                >
                  {employee.status}
                </span>
              </div>

              <p className="text-xs font-semibold text-neutral-600">
                {employee.designation} &bull; {employee.department?.name || 'Technology Division'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-500">
                <span className="font-mono bg-neutral-100 px-2.5 py-0.5 rounded-lg border border-neutral-200 font-bold text-neutral-900">
                  {employee.empCustomId}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    {employee.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-5 rounded-3xl border border-neutral-200 text-right w-full sm:w-auto">
            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider block">Compensation</span>
            <p className="text-2xl font-black text-neutral-900 font-mono mt-0.5">
              ₹{employee.salary ? Number(employee.salary).toLocaleString('en-IN') : '0'}
              <span className="text-xs font-normal text-neutral-500"> /mo</span>
            </p>
            <p className="text-[11px] text-neutral-600 mt-1 flex items-center gap-1 justify-end font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Joined {new Date(employee.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Profile' },
          { id: 'attendance', label: `Attendance (${attendance.length})` },
          { id: 'leaves', label: `Leaves (${leaves.length})` },
          { id: 'payroll', label: `Payrolls (${payrolls.length})` },
          { id: 'performance', label: `Appraisals (${reviews.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bento-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-200">
              Employment Dossier
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Department</span>
                <span className="font-semibold text-neutral-900">{employee.department?.name || 'Engineering'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Designation</span>
                <span className="font-semibold text-neutral-900">{employee.designation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Base Tech Hub</span>
                <span className="font-semibold text-neutral-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  Bengaluru R&D Hub (Tower 3)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Employment Type</span>
                <span className="font-semibold text-neutral-800">Full-Time (Permanent)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-500">Joining Date</span>
                <span className="font-semibold text-neutral-800">
                  {new Date(employee.joiningDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-200">
              Statutory & Bank Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Monthly CTC</span>
                <span className="font-mono font-bold text-neutral-900">
                  ₹{employee.salary ? Number(employee.salary).toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Statutory EPFO</span>
                <span className="font-semibold text-neutral-800">Active & Registered</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">TDS Tax Bracket</span>
                <span className="font-semibold text-neutral-800">10% Standard Rate</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-500">Disbursement Method</span>
                <span className="font-semibold text-neutral-900">UPI / Direct IMPS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Records */}
      {activeTab === 'attendance' && (
        <div className="bento-card p-6">
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No attendance punches recorded</p>
            ) : (
              attendance.map((att) => (
                <div
                  key={att._id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span className="font-semibold text-neutral-900">{att.date}</span>
                    <span className="text-neutral-500 font-mono">
                      {att.workHours ? `${att.workHours} hrs` : '--'}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      att.status === 'Present'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {att.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Leaves */}
      {activeTab === 'leaves' && (
        <div className="bento-card p-6">
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No leave requests filed</p>
            ) : (
              leaves.map((l) => (
                <div
                  key={l._id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-neutral-900 block">{l.leaveType}</span>
                    <span className="text-neutral-500 text-[11px]">
                      {new Date(l.startDate).toLocaleDateString('en-IN')} -{' '}
                      {new Date(l.endDate).toLocaleDateString('en-IN')} ({l.daysCount || 1} days)
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      l.status === 'Approved'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : l.status === 'Pending'
                        ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                        : 'bg-neutral-800 text-neutral-200 border-neutral-700'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Payrolls */}
      {activeTab === 'payroll' && (
        <div className="bento-card p-6">
          <div className="space-y-3">
            {payrolls.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No payroll vouchers generated</p>
            ) : (
              payrolls.map((p) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-neutral-900 block">
                      {p.month} {p.year} Pay Cycle
                    </span>
                    <span className="text-neutral-500 text-[11px] font-mono">
                      Gross: ₹{p.grossSalary?.toLocaleString('en-IN')} &bull; Deductions: -₹
                      {p.totalDeductions?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-900 font-mono text-sm block">
                      ₹{p.netSalary?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-neutral-600 font-semibold">{p.paymentStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Reviews */}
      {activeTab === 'performance' && (
        <div className="bento-card p-6">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No appraisals recorded for this employee</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 text-xs">{r.reviewPeriod}</span>
                    <span className="font-mono font-bold text-neutral-900 text-xs">⭐ {r.rating || 5}.0</span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed font-normal">{r.feedback}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
