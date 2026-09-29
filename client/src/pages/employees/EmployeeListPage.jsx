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
  Mail,
  Phone,
  Upload,
  ArrowUpRight,
  SlidersHorizontal,
  Plus,
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
    salary: '95000',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-Time',
    status: 'Active',
    gender: 'Prefer not to say',
    profilePicture: '',
    street: 'Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560103',
    bankName: 'HDFC Bank',
    accountNumber: '50100456789012',
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
        if (res.data.data.length > 0 && !formData.department) {
          setFormData((prev) => ({ ...prev, department: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      ...initialFormState,
      department: departments[0]?._id || '',
      empCustomId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

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
        salary: Number(formData.salary) || 0,
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
          country: 'India',
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
      header: 'Employee Details',
      render: (emp) => (
        <div className="flex items-center gap-3.5">
          <Avatar
            src={emp.profilePicture}
            name={`${emp.firstName} ${emp.lastName}`}
            size="md"
            className="ring-1 ring-[#A56ABD]/40"
          />
          <div>
            <Link
              to={`/employees/${emp._id}`}
              className="font-bold text-[#F5EBFA] hover:text-[#A56ABD] transition-colors block text-sm"
            >
              {emp.firstName} {emp.lastName}
            </Link>
            <p className="text-xs text-[#A56ABD] font-mono mt-0.5">{emp.empCustomId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Division & Role',
      render: (emp) => (
        <div>
          <p className="font-semibold text-[#F5EBFA] text-xs sm:text-sm">{emp.designation}</p>
          <span className="text-xs text-[#E7DBEF]/80">
            {emp.department?.name || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      render: (emp) => (
        <div className="text-xs space-y-0.5">
          <p className="text-[#E7DBEF] font-medium">{emp.email}</p>
          {emp.phone && <p className="text-[#A56ABD] font-mono">{emp.phone}</p>}
        </div>
      ),
    },
    {
      header: 'Employment Status',
      render: (emp) => (
        <div className="space-y-1">
          <Badge variant={emp.status}>{emp.status}</Badge>
          <p className="text-xs text-[#E7DBEF]/70">{emp.employmentType}</p>
        </div>
      ),
    },
    {
      header: 'Monthly Compensation',
      render: (emp) => (
        <span className="font-bold text-[#F5EBFA] font-mono text-xs sm:text-sm bg-[#271337] px-2.5 py-1 rounded-xl border border-[#A56ABD]/30 inline-block">
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
            className="p-2 rounded-xl text-[#E7DBEF] hover:text-[#F5EBFA] bg-[#271337] hover:bg-[#6E3482]/40 border border-[#A56ABD]/25"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEditModal(emp)}
                className="p-2 rounded-xl text-[#E7DBEF] hover:text-[#F5EBFA] bg-[#271337] hover:bg-[#6E3482]/40 border border-[#A56ABD]/25"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(emp)}
                className="p-2 rounded-xl text-[#A56ABD] hover:text-rose-300 bg-[#271337] hover:bg-rose-500/20 border border-[#A56ABD]/25"
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E3482]/30 border border-[#A56ABD]/40 text-[#F5EBFA] text-xs font-semibold mb-2 shadow-xs">
            <Users className="w-3.5 h-3.5 text-[#A56ABD]" />
            <span>Personnel Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5EBFA]">
            Employees & Talent Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#E7DBEF] mt-1">
            Manage Indian workforce profiles, roles, divisions, salary allocations, and corporate credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Download} size="md" onClick={exportToCSV}>
            Export CSV
          </Button>
          {isAdmin && (
            <Button variant="primary" icon={UserPlus} size="md" onClick={handleOpenAddModal}>
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar Bento */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A56ABD]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full pl-10 pr-3.5 py-2 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] placeholder-[#A56ABD]/50 focus:outline-none focus:border-[#A56ABD]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E7DBEF] uppercase tracking-wider">Division:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
            >
              <option value="all">All Divisions</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E7DBEF] uppercase tracking-wider">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl text-xs text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#E7DBEF] font-mono">
          Total: <span className="text-[#F5EBFA] font-bold">{employees.length}</span> personnel
        </div>
      </div>

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        emptyMessage="No employees found matching the search criteria"
      />

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmployee ? 'Edit Employee Dossier' : 'Register New Employee'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleFormChange}
              required
              placeholder="e.g. Aarav"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleFormChange}
              required
              placeholder="e.g. Sharma"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Work Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              placeholder="aarav.s@company.com"
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                required
                className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs py-2.5 px-3.5 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Designation / Title"
              name="designation"
              value={formData.designation}
              onChange={handleFormChange}
              required
              placeholder="e.g. Principal UI Architect"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly CTC (₹ INR)"
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleFormChange}
              required
              placeholder="95000"
            />
            <Input
              label="Joining Date"
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
                Profile Photo (URL or File)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  className="flex-1 rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs py-2.5 px-3.5 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2.5 rounded-2xl bg-[#6E3482] hover:bg-[#7f3d96] text-[#F5EBFA] text-xs font-bold transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>
            </div>
            <Input
              label="Employee Custom ID"
              name="empCustomId"
              value={formData.empCustomId}
              onChange={handleFormChange}
              required
              placeholder="EMP-1001"
            />
          </div>

          {!editingEmployee && (
            <div className="p-3.5 rounded-2xl bg-[#271337] border border-[#A56ABD]/30 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#F5EBFA] cursor-pointer">
                <input
                  type="checkbox"
                  name="createUserAccount"
                  checked={formData.createUserAccount}
                  onChange={handleFormChange}
                  className="rounded text-[#6E3482] focus:ring-[#A56ABD]"
                />
                <span>Automatically generate portal login credentials</span>
              </label>
              {formData.createUserAccount && (
                <Input
                  label="Temporary Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required={formData.createUserAccount}
                  placeholder="Minimum 6 characters"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#A56ABD]/20">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={formSubmitting}>
              {editingEmployee ? 'Update Profile' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Remove Employee"
        message={`Are you sure you want to remove ${employeeToDelete?.firstName} ${employeeToDelete?.lastName} from active records?`}
      />
    </div>
  );
};

export default EmployeeListPage;
