import React, { useState, useEffect, useRef } from 'react';
import { payrollApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  CreditCard,
  Plus,
  Zap,
  Download,
  Printer,
  DollarSign,
  FileText,
  Calendar,
  Building,
  User,
  Sparkles,
} from 'lucide-react';

const PayrollPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Single Form State
  const [form, setForm] = useState({
    employeeId: '',
    month: 'September',
    year: 2026,
    basicSalary: 6000,
    hra: 1200,
    conveyance: 200,
    medical: 150,
    bonus: 0,
    providentFund: 300,
    tax: 600,
    insurance: 100,
    notes: 'Monthly regular payroll',
  });

  const [bulkMonth, setBulkMonth] = useState('September');
  const [bulkYear, setBulkYear] = useState(2026);

  const payslipRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (monthFilter !== 'all') params.month = monthFilter;
      if (yearFilter) params.year = yearFilter;

      const [payRes, empRes] = await Promise.all([
        payrollApi.getAll(params),
        isAdmin ? employeeApi.getAll({ limit: 100 }) : Promise.resolve({ data: { success: true, data: [] } }),
      ]);

      if (payRes.data.success) setPayrolls(payRes.data.data);
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        if (empRes.data.data.length > 0 && !form.employeeId) {
          const firstEmp = empRes.data.data[0];
          setForm((prev) => ({
            ...prev,
            employeeId: firstEmp._id,
            basicSalary: firstEmp.salary || 6000,
            hra: Math.round((firstEmp.salary || 6000) * 0.2),
            providentFund: Math.round((firstEmp.salary || 6000) * 0.05),
            tax: Math.round((firstEmp.salary || 6000) * 0.1),
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monthFilter, yearFilter]);

  const handleEmployeeSelect = (empId) => {
    const emp = employees.find((e) => e._id === empId);
    if (emp) {
      const basic = emp.salary || 6000;
      setForm((prev) => ({
        ...prev,
        employeeId: empId,
        basicSalary: basic,
        hra: Math.round(basic * 0.2),
        providentFund: Math.round(basic * 0.05),
        tax: Math.round(basic * 0.1),
      }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        month: form.month,
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        allowances: {
          hra: Number(form.hra) || 0,
          conveyance: Number(form.conveyance) || 0,
          medical: Number(form.medical) || 0,
          special: 0,
        },
        deductions: {
          providentFund: Number(form.providentFund) || 0,
          tax: Number(form.tax) || 0,
          insurance: Number(form.insurance) || 0,
        },
        bonus: Number(form.bonus) || 0,
        notes: form.notes,
      };

      await payrollApi.create(payload);
      showToast('Payroll record generated successfully', 'success');
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate payroll', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      const res = await payrollApi.bulkGenerate({ month: bulkMonth, year: Number(bulkYear) });
      showToast(res.data.message || 'Bulk payroll generated!', 'success');
      setBulkModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk generation failed', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handlePrintPayslip = () => {
    window.print();
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
      header: 'Pay Period',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
          {row.month} {row.year}
        </span>
      ),
    },
    {
      header: 'Gross Salary',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          ${row.grossSalary?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Deductions',
      render: (row) => (
        <span className="font-mono text-xs text-rose-600 font-semibold">
          -${row.totalDeductions?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Net Disbursed',
      render: (row) => (
        <span className="font-mono text-sm font-black text-emerald-600">
          ${row.netSalary?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.paymentStatus}>{row.paymentStatus}</Badge>,
    },
    {
      header: 'Payslip',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          onClick={() => {
            setSelectedPayroll(row);
            setPayslipModalOpen(true);
          }}
        >
          View Slip
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Payroll & Compensation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain salary structures, taxes, bonuses, generate payslips, and process payouts.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              icon={Zap}
              size="sm"
              onClick={() => setBulkModalOpen(true)}
            >
              1-Click Bulk Run
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setCreateModalOpen(true)}
            >
              Generate Payslip
            </Button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Month:</label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Year:</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <DataTable
        columns={columns}
        data={payrolls}
        loading={loading}
        emptyMessage="No payroll records found"
      />

      {/* Payslip View Modal */}
      <Modal
        isOpen={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        title="Official Payslip"
        maxWidth="max-w-2xl"
      >
        {selectedPayroll && (
          <div className="space-y-6">
            <div ref={payslipRef} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 print:border-none">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">HR Pulse Enterprises</h2>
                  <p className="text-xs text-slate-400">742 Evergreen Terrace, San Francisco, CA 94107</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">
                    Payslip for {selectedPayroll.month} {selectedPayroll.year}
                  </p>
                </div>
                <Badge variant={selectedPayroll.paymentStatus}>{selectedPayroll.paymentStatus}</Badge>
              </div>

              {/* Employee & Bank Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <p className="text-slate-400 font-semibold">Employee Name</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {selectedPayroll.employee?.firstName} {selectedPayroll.employee?.lastName}
                  </p>
                  <p className="text-slate-500 mt-1">
                    Designation: {selectedPayroll.employee?.designation}
                  </p>
                  <p className="text-slate-500">ID: {selectedPayroll.employee?.empCustomId}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Payment Details</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    Method: {selectedPayroll.paymentMethod || 'Bank Transfer'}
                  </p>
                  <p className="text-slate-500 mt-1">
                    Bank: {selectedPayroll.employee?.bankDetails?.bankName || 'Chase Bank'}
                  </p>
                  <p className="text-slate-500 font-mono">
                    A/C: {selectedPayroll.employee?.bankDetails?.accountNumber || '••••••••'}
                  </p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase pb-1 border-b border-slate-100">
                    Earnings
                  </h5>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-mono font-semibold">${selectedPayroll.basicSalary}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-semibold">${selectedPayroll.allowances?.hra || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Conveyance Allowance</span>
                    <span className="font-mono font-semibold">${selectedPayroll.allowances?.conveyance || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Medical Allowance</span>
                    <span className="font-mono font-semibold">${selectedPayroll.allowances?.medical || 0}</span>
                  </div>
                  {selectedPayroll.bonus > 0 && (
                    <div className="flex justify-between py-1 text-emerald-600 font-bold">
                      <span>Performance Bonus</span>
                      <span className="font-mono">+${selectedPayroll.bonus}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total Gross</span>
                    <span className="font-mono">${selectedPayroll.grossSalary}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase pb-1 border-b border-slate-100">
                    Deductions
                  </h5>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Provident Fund (PF)</span>
                    <span className="font-mono font-semibold">${selectedPayroll.deductions?.providentFund || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-mono font-semibold">${selectedPayroll.deductions?.tax || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Health Insurance</span>
                    <span className="font-mono font-semibold">${selectedPayroll.deductions?.insurance || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-rose-600">
                    <span>Total Deductions</span>
                    <span className="font-mono">-${selectedPayroll.totalDeductions}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Net Take Home Pay
                  </span>
                  <p className="text-xs text-emerald-600 mt-0.5">Disbursed via automated direct deposit</p>
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  ${selectedPayroll.netSalary?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setPayslipModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={handlePrintPayslip}>
                Print Payslip
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate Single Payroll Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Employee Payslip"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Employee
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.empCustomId}) - Base: ${e.salary}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Month
              </label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Year"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Basic Salary ($)"
              type="number"
              value={form.basicSalary}
              onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
              required
            />
            <Input
              label="Bonus ($)"
              type="number"
              value={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="HRA ($)"
              type="number"
              value={form.hra}
              onChange={(e) => setForm({ ...form, hra: e.target.value })}
            />
            <Input
              label="Conveyance ($)"
              type="number"
              value={form.conveyance}
              onChange={(e) => setForm({ ...form, conveyance: e.target.value })}
            />
            <Input
              label="Medical ($)"
              type="number"
              value={form.medical}
              onChange={(e) => setForm({ ...form, medical: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Provident Fund ($)"
              type="number"
              value={form.providentFund}
              onChange={(e) => setForm({ ...form, providentFund: e.target.value })}
            />
            <Input
              label="Tax TDS ($)"
              type="number"
              value={form.tax}
              onChange={(e) => setForm({ ...form, tax: e.target.value })}
            />
            <Input
              label="Insurance ($)"
              type="number"
              value={form.insurance}
              onChange={(e) => setForm({ ...form, insurance: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Disburse & Save Payslip
            </Button>
          </div>
        </form>
      </Modal>

      {/* 1-Click Bulk Run Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="1-Click Automated Bulk Payroll Run"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will automatically calculate salaries, allowances, and tax deductions for{' '}
            <span className="font-bold text-slate-900">all active employees</span> based on their configured base compensation packages.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Target Month
              </label>
              <select
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Target Year"
              type="number"
              value={bulkYear}
              onChange={(e) => setBulkYear(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Zap} loading={bulkSubmitting}>
              Run Batch Payroll
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PayrollPage;
