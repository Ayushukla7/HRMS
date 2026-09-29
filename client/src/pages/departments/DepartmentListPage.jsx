import React, { useState, useEffect } from 'react';
import { departmentApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Building2,
  Plus,
  Users,
  MapPin,
  Edit2,
  Trash2,
  Crown,
  TrendingUp,
  Layers,
} from 'lucide-react';

const DepartmentListPage = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    budget: '',
    location: 'Bengaluru R&D Hub - Tower 3',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentApi.getAll(),
        employeeApi.getAll({ limit: 100 }),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      headOfDepartment: '',
      budget: '5000000',
      location: 'Bengaluru R&D Hub - Tower 3',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      headOfDepartment: dept.headOfDepartment?._id || dept.headOfDepartment || '',
      budget: dept.budget || '',
      location: dept.location || 'Bengaluru R&D Hub',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        await departmentApi.update(editingDept._id, formData);
        showToast('Department updated successfully', 'success');
      } else {
        await departmentApi.create(formData);
        showToast('Department created successfully', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (dept) => {
    setDeptToDelete(dept);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    setDeleteLoading(true);
    try {
      await departmentApi.delete(deptToDelete._id);
      showToast('Department deleted successfully', 'success');
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading organizational departments..." />;
  }

  const totalHeadcount = departments.reduce((acc, d) => acc + (d.employeeCount || 0), 0);
  const totalBudget = departments.reduce((acc, d) => acc + (Number(d.budget) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Organizational Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            Departments & Business Units
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Corporate division hierarchy, leadership allocation, regional tech hubs, and annual fiscal budgets.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="md"
            onClick={handleOpenAdd}
          >
            Add Department
          </Button>
        )}
      </div>

      {/* Top Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Active Divisions</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-900 font-mono">{departments.length}</span>
            <span className="text-xs text-neutral-600 font-semibold">Specialized Units</span>
          </div>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Workforce</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-900 font-mono">{totalHeadcount}</span>
            <span className="text-xs text-neutral-600 font-semibold">Active Members</span>
          </div>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Combined Annual Budget</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-900 font-mono">
              ₹{(totalBudget / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-xs text-neutral-600 font-semibold">FY 2026-27</span>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          return (
            <div
              key={dept._id}
              className="bento-card p-6 flex flex-col justify-between group hover:border-black transition-all relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 border border-neutral-300 flex items-center justify-center font-black text-sm shadow-xs"
                    >
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-black transition-colors">
                        {dept.name}
                      </h3>
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        {dept.location || 'Bengaluru R&D Hub'}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="p-1.5 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-600 mt-3.5 line-clamp-2 leading-relaxed font-normal">
                  {dept.description || 'Core strategic business division driving company operations.'}
                </p>

                {/* Head of Department */}
                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-neutral-700" />
                    <span className="text-neutral-500 text-[11px]">Division Head:</span>
                  </div>
                  <span className="font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                    {dept.headOfDepartment
                      ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`
                      : 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Footer Stats Grid */}
              <div className="mt-5 pt-3 border-t border-neutral-200 grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider">Headcount</span>
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5 mt-1">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    {dept.employeeCount || 0} Members
                  </span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider">Fiscal Budget</span>
                  <span className="font-bold text-neutral-900 flex items-center gap-1 mt-1 font-mono">
                    ₹{dept.budget ? (dept.budget / 100000).toFixed(1) + ' Lakhs' : '₹0'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g. Artificial Intelligence & Platform"
          />
          <Input
            label="Department Code (2-4 Letters)"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            placeholder="e.g. AI"
          />
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Department Head / Director
            </label>
            <select
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs py-2.5 px-3 text-neutral-900 focus:outline-none focus:border-black"
            >
              <option value="">-- Select Personnel --</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.designation})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Annual Budget Allocation (₹ INR)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="5000000"
          />
          <Input
            label="Regional Hub / Floor"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Bengaluru R&D Hub - Tower 3"
          />
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Charter & Responsibilities
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs p-3 text-neutral-900 focus:outline-none focus:border-black"
              placeholder="Brief summary of department responsibilities and mission..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete Department"
        message={`Are you sure you want to delete ${deptToDelete?.name}? All associated assignments will be unlinked.`}
      />
    </div>
  );
};

export default DepartmentListPage;
