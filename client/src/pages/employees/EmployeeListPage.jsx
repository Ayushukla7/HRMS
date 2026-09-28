import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeApi, departmentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

const EmployeeListPage = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const initialFormState = {
    empCustomId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-Time',
    status: 'Active',
    gender: 'Prefer not to say',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    bankName: '',
    accountNumber: '',
    createUserAccount: true,
    password: 'Password123!',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedDept !== 'all') params.department = selectedDept;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await employeeApi.getAll(params);
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedDept, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      ...initialFormState,
      department: departments[0]?._id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      empCustomId: emp.empCustomId || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department?._id || emp.department || '',
      designation: emp.designation || '',
      salary: emp.salary || '',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      employmentType: emp.employmentType || 'Full-Time',
      status: emp.status || 'Active',
      gender: emp.gender || 'Prefer not to say',
      street: emp.address?.street || '',
      city: emp.address?.city || '',
      state: emp.address?.state || '',
      zipCode: emp.address?.zipCode || '',
      bankName: emp.bankDetails?.bankName || '',
      accountNumber: emp.bankDetails?.accountNumber || '',
      createUserAccount: false,
      password: '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        empCustomId: formData.empCustomId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        salary: Number(formData.salary),
        joiningDate: formData.joiningDate,
        employmentType: formData.employmentType,
        status: formData.status,
        gender: formData.gender,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
        },
        createUserAccount: formData.createUserAccount,
        password: formData.password,
      };

      if (editingEmployee) {
        await employeeApi.update(editingEmployee._id, payload);
        showToast('Employee updated successfully', 'success');
      } else {
        await employeeApi.create(payload);
        showToast('Employee created successfully', 'success');
      }

      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);
    try {
      await employeeApi.delete(employeeToDelete._id);
      showToast('Employee deleted successfully', 'success');
      setDeleteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (employees.length === 0) return;
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation', 'Salary', 'Status'];
    const rows = employees.map(e => [
      e.empCustomId,
      e.firstName,
      e.lastName,
      e.email,
      e.phone || '',
      e.department?.name || '',
      e.designation,
      e.salary,
      e.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: 'Employee',
      render: (emp) => (
        <div className="flex items-center gap-3">
          <img
            src={emp.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}`}
            alt=""
            className="w-10 h-10 rounded-full object-cover bg-slate-100 ring-2 ring-indigo-500/20"
          />
          <div>
            <Link
              to={`/employees/${emp._id}`}
              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
            >
              {emp.firstName} {emp.lastName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{emp.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Role',
      render: (emp) => (
        <div>
          <p className="font-semibold text-slate-800">{emp.designation}</p>
          <span className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
            {emp.department?.name || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (emp) => (
        <div className="text-xs space-y-1">
          <p className="text-slate-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{emp.email}</span>
          </p>
          {emp.phone && (
            <p className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{emp.phone}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Type & Status',
      render: (emp) => (
        <div className="space-y-1">
          <Badge variant={emp.status}>{emp.status}</Badge>
          <p className="text-[11px] text-slate-400">{emp.employmentType}</p>
        </div>
      ),
    },
    {
      header: 'Monthly Salary',
      render: (emp) => (
        <span className="font-semibold text-slate-900">
          ${emp.salary ? Number(emp.salary).toLocaleString() : '0'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (emp) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/employees/${emp._id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEditModal(emp)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(emp)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Employee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee profiles, designations, contact information, and account access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" icon={Download} size="sm" onClick={exportToCSV}>
            Export CSV
          </Button>
          {isAdmin && (
            <Button variant="primary" icon={UserPlus} size="sm" onClick={handleOpenAddModal}>
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, designation, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        emptyMessage="No employees found matching criteria"
      />

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID (Optional)"
              name="empCustomId"
              value={formData.empCustomId}
              onChange={(e) => setFormData({ ...formData, empCustomId: e.target.value })}
              placeholder="e.g. EMP-0007"
            />
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3 focus:outline-none focus:border-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              placeholder="Sarah"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              placeholder="Jenkins"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="sarah.jenkins@company.com"
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Designation / Role"
              name="designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
              placeholder="Senior Engineer"
            />
            <Input
              label="Monthly Basic Salary ($)"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
              placeholder="8500"
            />
            <Input
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Address & Bank info */}
          <div className="pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Address & Bank Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City / State"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="San Francisco, CA"
              />
              <Input
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Chase Bank"
              />
            </div>
          </div>

          {!editingEmployee && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createUserAccount}
                  onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-indigo-900">
                  Automatically create User Login Account (Password: {formData.password})
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formSubmitting}>
              {editingEmployee ? 'Update Employee' : 'Save Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Employee Record"
        message={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This will permanently remove their records.`}
      />
    </div>
  );
};

export default EmployeeListPage;
