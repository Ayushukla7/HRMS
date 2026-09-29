import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeApi, attendanceApi, leaveApi, payrollApi, performanceApi } from '../../api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Award,
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
    return <LoadingSpinner text="Loading employee profile..." />;
  }

  if (!employee) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Employee record not found.</p>
        <Link to="/employees">
          <Button variant="primary" size="sm">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/employees"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Employee Directory</span>
      </Link>

      {/* Main Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={employee.profilePicture}
              name={`${employee.firstName} ${employee.lastName}`}
              size="2xl"
              className="w-20 h-20"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge variant={employee.status}>{employee.status}</Badge>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {employee.designation} &bull; {employee.department?.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300">
                  {employee.empCustomId}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {employee.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-right w-full sm:w-auto">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Compensation</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              ${employee.salary ? Number(employee.salary).toLocaleString() : '0'}
              <span className="text-xs font-normal text-slate-400"> /mo</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Joined {new Date(employee.joiningDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Details' },
          { id: 'attendance', label: `Attendance (${attendance.length})` },
          { id: 'leaves', label: `Leaves (${leaves.length})` },
          { id: 'payroll', label: `Payroll (${payrolls.length})` },
          { id: 'performance', label: `Reviews (${reviews.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Employment Type</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.employmentType}</p>
              </div>
              <div>
                <span className="text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.department?.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Date of Joining</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{new Date(employee.joiningDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Gender</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Address & Banking
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Address</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.address?.city ? `${employee.address?.street || ''}, ${employee.address?.city}, ${employee.address?.state || ''}` : 'No address specified'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Bank Name</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employee.bankDetails?.bankName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Account Number</span>
                <p className="font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">{employee.bankDetails?.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">IFSC / Routing</span>
                <p className="font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">{employee.bankDetails?.ifscCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Attendance History</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attendance.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No attendance records found</p>
            ) : (
              attendance.map((a) => (
                <div key={a._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{a.date}</span>
                    <p className="text-slate-400">
                      In: {a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '--'} | Out: {a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '--'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-600 dark:text-slate-300">{a.workHours} hrs</span>
                    <Badge variant={a.status}>{a.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Leave History</h3>
          {leaves.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No leave records</p>
          ) : (
            leaves.map((l) => (
              <div key={l._id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{l.leaveType}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()} &bull; {l.daysCount} day(s)
                  </p>
                  <p className="text-[11px] text-slate-400 italic mt-0.5">"{l.reason}"</p>
                </div>
                <Badge variant={l.status}>{l.status}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Salary & Payslips</h3>
          {payrolls.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No payroll records</p>
          ) : (
            payrolls.map((p) => (
              <div key={p._id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{p.month} {p.year}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Basic: ${p.basicSalary} | Deductions: -${p.totalDeductions}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">${p.netSalary?.toLocaleString()}</p>
                  <Badge variant={p.paymentStatus}>{p.paymentStatus}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Performance Appraisals</h3>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No reviews recorded</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.reviewPeriod} Evaluation</h4>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Score: {r.rating} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{r.feedback}</p>
                {r.achievements && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Achievement: {r.achievements}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
