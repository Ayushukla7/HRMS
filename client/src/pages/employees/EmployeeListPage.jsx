import React, { useState, useEffect, useRef } from 'react';
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
import Avatar from '../../components/common/Avatar';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Edit2,
  Trash2,
  Eye,
  Upload,
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

  const fileInputRef = useRef(null);

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
    profilePicture: '',
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
      profilePicture: emp.profilePicture || '',
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

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
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
        profilePicture: formData.profilePicture,
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
        showToast('Employee profile updated successfully', 'success');
      } else {
        await employeeApi.create(payload);
        showToast('Employee added to organization', 'success');
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
      showToast('Employee removed successfully', 'success');
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
    const rows = employees.map((e) => [
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
          <Avatar
            src={emp.profilePicture}
            name={`${emp.firstName} ${emp.lastName}`}
            size="md"
          />
          <div>
            <Link
              to={`/employees/${emp._id}`}
              className="font-semibold text-black hover:underline block text-sm"
            >
              {emp.firstName} {emp.lastName}
            </Link>
            <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{emp.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Role',
      render: (emp) => (
        <div>
          <p className="font-medium text-black text-xs sm:text-sm">{emp.designation}</p>
          <span className="text-xs text-neutral-500">
            {emp.department?.name || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (emp) => (
        <div className="text-xs space-y-0.5">
          <p className="text-neutral-700 font-medium">{emp.email}</p>
          {emp.phone && <p className="text-neutral-500 font-mono">{emp.phone}</p>}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (emp) => (
        <div className="space-y-1">
          <Badge variant={emp.status}>{emp.status}</Badge>
          <p className="text-[10px] text-neutral-500">{emp.employmentType}</p>
        </div>
      ),
    },
    {
      header: 'Monthly Base (CTC)',
      render: (emp) => (
        <span className="font-semibold text-black font-mono text-xs sm:text-sm">
          ₹{emp.salary ? Number(emp.salary).toLocaleString('en-IN') : '0'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (emp) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/employees/${emp._id}`}
            className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEditModal(emp)}
                className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 cursor-pointer"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(emp)}
                className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 cursor-pointer"
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage organizational workforce profiles, divisions, salaries, and user accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenAddModal}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, designation, or employee ID..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-black"
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
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-black"
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
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex items-center gap-4 pb-3 border-b border-neutral-200">
            <Avatar
              src={formData.profilePicture}
              name={`${formData.firstName || 'New'} ${formData.lastName || 'User'}`}
              size="lg"
            />
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFile}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
              <p className="text-[11px] text-neutral-500 mt-1">
                Upload portrait photo (PNG, JPG under 5MB)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Employee ID (Optional)"
              name="empCustomId"
              value={formData.empCustomId}
              onChange={(e) => setFormData({ ...formData, empCustomId: e.target.value })}
              placeholder="e.g. EMP-1011"
            />
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Department <span className="text-black">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="block w-full rounded-lg border border-neutral-300 bg-white text-xs py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              placeholder="Aarav"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              placeholder="Sharma"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Work Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="aarav.sharma@hrms.com"
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Designation / Role"
              name="designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
              placeholder="Lead Engineer"
            />
            <Input
              label="Monthly Base CTC (₹)"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
              placeholder="110000"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="block w-full rounded-lg border border-neutral-300 bg-white text-xs py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full rounded-lg border border-neutral-300 bg-white text-xs py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="block w-full rounded-lg border border-neutral-300 bg-white text-xs py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200">
            <h5 className="text-xs font-bold text-black mb-2 uppercase tracking-wider">
              Banking & Address
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City / State"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Gurugram, Haryana"
              />
              <Input
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="HDFC Bank"
              />
            </div>
          </div>

          {!editingEmployee && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createUserAccount}
                  onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked })}
                  className="rounded border-neutral-300 text-black focus:ring-black"
                />
                <span className="text-xs font-medium text-neutral-700">
                  Provision User Portal Login (Default password: {formData.password})
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={formSubmitting}>
              {editingEmployee ? 'Update Profile' : 'Save Employee'}
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
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action removes all linked records.`}
      />
    </div>
  );
};

export default EmployeeListPage;
