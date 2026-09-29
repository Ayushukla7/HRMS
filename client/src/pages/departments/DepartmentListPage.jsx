import React, { useState, useEffect } from 'react';
import { departmentApi, employeeApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Avatar from '../../components/common/Avatar';
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
  Sparkles,
  TrendingUp,
  Layers,
  CheckCircle2,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E3482]/30 border border-[#A56ABD]/40 text-[#F5EBFA] text-xs font-semibold mb-2 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-[#A56ABD]" />
            <span>Organizational Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5EBFA]">
            Departments & Business Units
          </h1>
          <p className="text-xs sm:text-sm text-[#E7DBEF] mt-1">
            Corporate division hierarchy, leadership allocation, regional Indian tech hubs, and annual fiscal budgets.
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#A56ABD]">Active Divisions</span>
            <div className="p-2 rounded-xl bg-[#6E3482]/40 text-[#F5EBFA]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5EBFA] font-mono">{departments.length}</span>
            <span className="text-xs text-[#E7DBEF] font-semibold">Specialized Units</span>
          </div>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A56ABD]">Total Workforce</span>
            <div className="p-2 rounded-xl bg-[#6E3482]/40 text-[#F5EBFA]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5EBFA] font-mono">{totalHeadcount}</span>
            <span className="text-xs text-[#E7DBEF] font-semibold">Active Members</span>
          </div>
        </div>

        <div className="bento-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A56ABD]">Combined Annual Budget</span>
            <div className="p-2 rounded-xl bg-[#6E3482]/40 text-[#F5EBFA]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5EBFA] font-mono">
              ₹{(totalBudget / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-xs text-[#A56ABD] font-semibold">FY 2026-27</span>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bento-card p-6 flex flex-col justify-between group relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A56ABD]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#6E3482] to-[#49225B] border border-[#A56ABD]/50 flex items-center justify-center font-black text-sm text-[#F5EBFA] shadow-md"
                  >
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F5EBFA] group-hover:text-[#A56ABD] transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-xs text-[#E7DBEF]/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A56ABD]" />
                      {dept.location || 'Bengaluru R&D Hub'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 bg-[#271337] p-1 rounded-2xl border border-[#A56ABD]/30">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 text-[#E7DBEF] hover:text-[#F5EBFA] rounded-xl hover:bg-[#6E3482]/40 transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-1.5 text-[#A56ABD] hover:text-rose-300 rounded-xl hover:bg-rose-500/20 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#E7DBEF]/90 mt-3.5 line-clamp-2 leading-relaxed font-normal">
                {dept.description || 'Core strategic business division driving company operations.'}
              </p>

              {/* Head of Department */}
              <div className="mt-4 pt-3 border-t border-[#A56ABD]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#A56ABD]" />
                  <span className="text-[#E7DBEF]">Division Head:</span>
                </div>
                <span className="font-semibold text-[#F5EBFA] bg-[#271337] px-2.5 py-1 rounded-xl border border-[#A56ABD]/30">
                  {dept.headOfDepartment
                    ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`
                    : 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Footer Stats Grid */}
            <div className="mt-5 pt-3 border-t border-[#A56ABD]/20 grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#271337] p-3 rounded-2xl border border-[#A56ABD]/25">
                <span className="text-[#A56ABD] block text-[10px] uppercase font-bold tracking-wider">Headcount</span>
                <span className="font-bold text-[#F5EBFA] flex items-center gap-1.5 mt-1 text-xs sm:text-sm">
                  <Users className="w-4 h-4 text-[#A56ABD]" />
                  {dept.employeeCount || 0} Members
                </span>
              </div>
              <div className="bg-[#271337] p-3 rounded-2xl border border-[#A56ABD]/25">
                <span className="text-[#A56ABD] block text-[10px] uppercase font-bold tracking-wider">Fiscal Budget</span>
                <span className="font-bold text-[#F5EBFA] flex items-center gap-1 mt-1 font-mono text-xs sm:text-sm">
                  ₹{dept.budget ? (dept.budget / 100000).toFixed(1) + ' Lakhs' : '₹0'}
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
        title={editingDept ? 'Edit Organizational Department' : 'Create New Department'}
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
            <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
              Department Head / Director
            </label>
            <select
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs py-2.5 px-3.5 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
            >
              <option value="">-- Select Indian Personnel --</option>
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
            label="Regional Indian Hub / Floor"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Bengaluru R&D Hub - Tower 3"
          />
          <div>
            <label className="block text-xs font-bold text-[#E7DBEF] mb-1.5 uppercase tracking-wider">
              Charter & Responsibilities
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-2xl border border-[#A56ABD]/30 bg-[#271337] text-xs p-3 text-[#F5EBFA] focus:outline-none focus:border-[#A56ABD]"
              placeholder="Brief summary of department responsibilities and mission..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#A56ABD]/20">
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
