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
  DollarSign,
  MapPin,
  Edit2,
  Trash2,
  Crown,
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
    location: 'Main Office - Floor 2',
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
      budget: '',
      location: 'Main Office - Floor 2',
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
      location: dept.location || 'Main Office',
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
    return <LoadingSpinner text="Loading departments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Departments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize departments, manage departmental budgets, and assign leadership.
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" icon={Plus} size="sm" onClick={handleOpenAdd}>
            Add Department
          </Button>
        )}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {dept.location}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-2">
                {dept.description || 'No description provided for this department.'}
              </p>

              {/* Head of Department */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-500">Head:</span>
                <span className="font-semibold text-slate-800">
                  {dept.headOfDepartment
                    ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`
                    : 'Not Assigned'}
                </span>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Workforce</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {dept.employeeCount || 0} Members
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Budget</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  ${dept.budget ? (dept.budget / 1000).toFixed(0) + 'k' : '0'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g. Artificial Intelligence Research"
          />
          <Input
            label="Department Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            placeholder="e.g. AIR"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Head of Department
            </label>
            <select
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm py-2.5 px-3"
            >
              <option value="">-- Select Department Head --</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.designation})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Annual Budget ($)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="500000"
          />
          <Input
            label="Office Location"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Building A - Floor 2"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-xl border border-slate-200 bg-white text-sm p-3 focus:outline-none focus:border-indigo-500"
              placeholder="Brief summary of department responsibilities..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingDept ? 'Update Department' : 'Create Department'}
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
        message={`Are you sure you want to delete ${deptToDelete?.name}? Make sure no active employees are assigned to it.`}
      />
    </div>
  );
};

export default DepartmentListPage;
