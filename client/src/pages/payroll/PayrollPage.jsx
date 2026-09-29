import React, { useState, useEffect, useRef } from 'react';
import { payrollApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import {
  CreditCard,
  Plus,
  Zap,
  Printer,
  FileText,
  DollarSign,
  Download,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Landmark,
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
    basicSalary: 85000,
    hra: 34000,
    conveyance: 5000,
    medical: 3000,
    bonus: 0,
    providentFund: 4250,
    tax: 8500,
    insurance: 1500,
    paymentMethod: 'UPI / IMPS',
    notes: 'Monthly salary disbursement via RazorpayX / Direct Transfer',
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
          const basic = firstEmp.salary || 85000;
          setForm((prev) => ({
            ...prev,
            employeeId: firstEmp._id,
            basicSalary: basic,
            hra: Math.round(basic * 0.4),
            conveyance: 5000,
            medical: 3000,
            providentFund: Math.round(basic * 0.05),
            tax: Math.round(basic * 0.1),
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
      const basic = emp.salary || 85000;
      setForm((prev) => ({
        ...prev,
        employeeId: empId,
        basicSalary: basic,
        hra: Math.round(basic * 0.4),
        conveyance: 5000,
        medical: 3000,
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
        paymentMethod: form.paymentMethod || 'UPI / IMPS',
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
      showToast(res.data.message || 'Bulk payroll calculated for all Indian staff', 'success');
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

  // Financial Aggregates
  const totalNetDisbursed = payrolls.reduce((acc, p) => acc + (Number(p.netSalary) || 0), 0);
  const totalGrossDisbursed = payrolls.reduce((acc, p) => acc + (Number(p.grossSalary) || 0), 0);
  const totalTaxDeductions = payrolls.reduce((acc, p) => acc + (Number(p.totalDeductions) || 0), 0);
  const avgNetSalary = payrolls.length > 0 ? Math.round(totalNetDisbursed / payrolls.length) : 0;

  const columns = [
    {
      header: 'Employee Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.employee?.profilePicture}
            name={`${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`}
            size="md"
            className="ring-2 ring-white/10"
          />
          <div>
            <span className="font-bold text-slate-100 text-sm block">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <span className="text-[11px] text-cyan-400 font-mono tracking-wider">
              {row.employee?.empCustomId || 'EMP-ID'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Pay Cycle',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {row.month} {row.year}
          </span>
        </div>
      ),
    },
    {
      header: 'Gross Earnings',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-300">
          ₹{row.grossSalary ? Number(row.grossSalary).toLocaleString('en-IN') : '0'}
        </span>
      ),
    },
    {
      header: 'EPF & TDS Deductions',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          -₹{row.totalDeductions ? Number(row.totalDeductions).toLocaleString('en-IN') : '0'}
        </span>
      ),
    },
    {
      header: 'Net Disbursed',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-block">
          ₹{row.netSalary ? Number(row.netSalary).toLocaleString('en-IN') : '0'}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      render: (row) => {
        const isPaid = row.paymentStatus === 'Paid';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isPaid
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {row.paymentStatus}
          </span>
        );
      },
    },
    {
      header: 'Salary Statement',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedPayroll(row);
            setPayslipModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181922] hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 text-xs font-semibold transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Voucher</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Compensation & Payroll Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Payroll & Indian Tax Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Calculate gross salaries, EPF/TDS statutory deductions, execute automated batch payroll, and download tax vouchers.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={Zap}
              onClick={() => setBulkModalOpen(true)}
              className="bg-[#181922] border-white/[0.08] text-slate-200 hover:bg-slate-800"
            >
              Batch Auto-Disburse
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
              className="shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
            >
              Generate Payslip
            </Button>
          </div>
        )}
      </div>

      {/* Financial Bento Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Disbursed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ₹{totalNetDisbursed ? Number(totalNetDisbursed).toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All direct IMPS transfers cleared
          </p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Wage Allocation</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ₹{totalGrossDisbursed ? Number(totalGrossDisbursed).toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pre-deduction corporate salary pool</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">EPF & TDS Withholdings</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ₹{totalTaxDeductions ? Number(totalTaxDeductions).toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Remitted to Indian EPFO & Income Tax</p>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Salary / Member</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ₹{avgNetSalary ? Number(avgNetSalary).toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <p className="text-[11px] text-cyan-400 mt-1 font-medium">Competitive Tier-1 Tech Baseline</p>
        </div>
      </div>

      {/* Filter Bar Bento */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month:</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#181922] border border-white/[0.08] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fiscal Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#181922] border border-white/[0.08] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-white font-bold">{payrolls.length}</span> payroll vouchers
        </div>
      </div>

      {/* Payroll Table */}
      <DataTable
        columns={columns}
        data={payrolls}
        loading={loading}
        emptyMessage="No salary disbursements found for this period"
      />

      {/* Bulk Generate Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Execute Automated Batch Payroll"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            This will calculate gross salary, HRA, Provident Fund (EPF), and professional tax deductions for all active
            Indian team members for the selected pay cycle.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Disbursement Month
            </label>
            <select
              value={bulkMonth}
              onChange={(e) => setBulkMonth(e.target.value)}
              className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs py-2.5 px-3 text-slate-100 focus:outline-none focus:border-cyan-500"
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
            value={bulkYear}
            onChange={(e) => setBulkYear(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" onClick={() => setBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={bulkSubmitting}>
              Run Batch Payroll
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Single Payslip Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Individual Salary Voucher"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Indian Employee
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => {
                setForm({ ...form, employeeId: e.target.value });
                handleEmployeeSelect(e.target.value);
              }}
              required
              className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs py-2.5 px-3 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.empCustomId}) - {e.designation} (₹{e.salary?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pay Month
              </label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="block w-full rounded-xl border border-white/[0.08] bg-[#181922] text-xs py-2 px-3 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Fiscal Year"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181922] border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Earnings & Allowances (₹ INR)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Input
                label="Basic Salary (₹)"
                type="number"
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                required
              />
              <Input
                label="HRA (₹)"
                type="number"
                value={form.hra}
                onChange={(e) => setForm({ ...form, hra: e.target.value })}
              />
              <Input
                label="Conveyance (₹)"
                type="number"
                value={form.conveyance}
                onChange={(e) => setForm({ ...form, conveyance: e.target.value })}
              />
              <Input
                label="Performance Bonus"
                type="number"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181922] border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Statutory Deductions (₹ INR)</h4>
            <div className="grid grid-cols-3 gap-2.5">
              <Input
                label="Provident Fund (EPF)"
                type="number"
                value={form.providentFund}
                onChange={(e) => setForm({ ...form, providentFund: e.target.value })}
              />
              <Input
                label="Income Tax (TDS)"
                type="number"
                value={form.tax}
                onChange={(e) => setForm({ ...form, tax: e.target.value })}
              />
              <Input
                label="Health Insurance"
                type="number"
                value={form.insurance}
                onChange={(e) => setForm({ ...form, insurance: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Generate & Disburse
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payslip Voucher Modal */}
      {selectedPayroll && (
        <Modal
          isOpen={payslipModalOpen}
          onClose={() => setPayslipModalOpen(false)}
          title="Indian Statutory Salary Slip"
          maxWidth="max-w-2xl"
        >
          <div ref={payslipRef} className="space-y-6 text-slate-200">
            {/* Payslip Header */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-[#121319] to-cyan-950/40 border border-white/[0.08] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                    HR
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">HR PULSE TECHNOLOGIES INDIA PVT LTD</h3>
                    <p className="text-[11px] text-slate-400">Electronic City Phase 1, Bengaluru, Karnataka 560100</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-cyan-400 font-mono font-bold block">
                  CYCLE: {selectedPayroll.month?.toUpperCase()} {selectedPayroll.year}
                </span>
                <span className="text-[10px] text-slate-400">PAYSLIP NO: HRP-{selectedPayroll._id?.slice(-6).toUpperCase()}</span>
              </div>
            </div>

            {/* Employee Dossier Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#181922] border border-white/[0.06] text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Name</span>
                <span className="text-white font-bold">
                  {selectedPayroll.employee?.firstName} {selectedPayroll.employee?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Custom ID</span>
                <span className="text-cyan-400 font-mono font-bold">{selectedPayroll.employee?.empCustomId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Designation</span>
                <span className="text-slate-200">{selectedPayroll.employee?.designation || 'Staff'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Disbursement Mode</span>
                <span className="text-emerald-400 font-bold">{selectedPayroll.paymentMethod || 'UPI / IMPS'}</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Earnings Table */}
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#181922]/50">
                <div className="p-3 bg-indigo-500/10 border-b border-white/[0.08] text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Earnings Breakdown
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Basic Wage</span>
                    <span className="font-mono text-white">
                      ₹{selectedPayroll.basicSalary?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">House Rent Allowance (HRA)</span>
                    <span className="font-mono text-white">
                      ₹{selectedPayroll.allowances?.hra?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conveyance Allowance</span>
                    <span className="font-mono text-white">
                      ₹{selectedPayroll.allowances?.conveyance?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Performance Incentive</span>
                    <span className="font-mono text-white">
                      ₹{selectedPayroll.bonus?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.08] flex justify-between font-bold text-sm">
                    <span className="text-slate-200">Gross Earnings</span>
                    <span className="font-mono text-indigo-300">
                      ₹{selectedPayroll.grossSalary?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#181922]/50">
                <div className="p-3 bg-rose-500/10 border-b border-white/[0.08] text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Statutory Deductions
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Employees' PF (EPF)</span>
                    <span className="font-mono text-rose-300">
                      -₹{selectedPayroll.deductions?.providentFund?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Income Tax (TDS)</span>
                    <span className="font-mono text-rose-300">
                      -₹{selectedPayroll.deductions?.tax?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Medical / Health Policy</span>
                    <span className="font-mono text-rose-300">
                      -₹{selectedPayroll.deductions?.insurance?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.08] flex justify-between font-bold text-sm">
                    <span className="text-slate-200">Total Deductions</span>
                    <span className="font-mono text-rose-400">
                      -₹{selectedPayroll.totalDeductions?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Amount Hero Banner */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Net Salary Disbursed to Bank
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-0.5 block">
                  ₹{selectedPayroll.netSalary?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                  Verified & Disbursed
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <Button variant="secondary" size="sm" onClick={() => setPayslipModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={handlePrintPayslip}>
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PayrollPage;
