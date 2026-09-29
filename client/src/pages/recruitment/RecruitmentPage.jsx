import React, { useState, useEffect } from 'react';
import { jobApi, applicationApi, departmentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  UserPlus,
  Plus,
  MapPin,
  Users,
  Star,
  Layers,
  Mail,
} from 'lucide-react';

const RecruitmentPage = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'jobs'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: 'Bengaluru R&D Hub / Hybrid',
    employmentType: 'Full-Time',
    experience: '3-6 years',
    salaryMin: 1800000,
    salaryMax: 3200000,
    description: '',
    openings: 2,
    status: 'Active',
  });

  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [candidateSubmitting, setCandidateSubmitting] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    job: '',
    applicantName: '',
    email: '',
    phone: '',
    experienceYears: 4,
    coverLetter: '',
    status: 'Applied',
    rating: 5,
    notes: 'Experienced candidate with deep engineering background',
  });

  const stages = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobRes, appRes, deptRes] = await Promise.all([
        jobApi.getAll(),
        applicationApi.getAll(),
        departmentApi.getAll(),
      ]);

      if (jobRes.data.success) setJobs(jobRes.data.data);
      if (appRes.data.success) setApplications(appRes.data.data);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
        if (deptRes.data.data.length > 0 && !jobForm.department) {
          setJobForm((prev) => ({ ...prev, department: deptRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobSubmitting(true);
    try {
      await jobApi.create({
        ...jobForm,
        salaryRange: { min: Number(jobForm.salaryMin), max: Number(jobForm.salaryMax), currency: 'INR' },
      });
      showToast('Job requisition published successfully', 'success');
      setJobModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create job', 'error');
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    setCandidateSubmitting(true);
    try {
      await applicationApi.create(candidateForm);
      showToast('Candidate enrolled into ATS recruitment pipeline', 'success');
      setCandidateModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add candidate', 'error');
    } finally {
      setCandidateSubmitting(false);
    }
  };

  const handleUpdateStage = async (applicationId, newStatus) => {
    try {
      await applicationApi.updateStatus(applicationId, { status: newStatus });
      showToast(`Candidate moved to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update stage', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading ATS recruitment pipeline..." />;
  }

  const stageBadgeColor = (stage) => {
    switch (stage) {
      case 'Applied':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'Screening':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'Interview':
        return 'bg-neutral-200 text-black border-neutral-300';
      case 'Offered':
        return 'bg-black text-white border-black';
      case 'Hired':
        return 'bg-black text-white border-black';
      case 'Rejected':
        return 'bg-neutral-100 text-neutral-500 border-neutral-300 line-through';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Applicant Tracking & Talent Acquisition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            Recruitment & Hiring Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Requisition postings, candidate stages, Kanban candidate pipeline, and hiring tracking.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={UserPlus}
              size="md"
              onClick={() => {
                if (jobs.length > 0 && !candidateForm.job) {
                  setCandidateForm((prev) => ({ ...prev, job: jobs[0]._id }));
                }
                setCandidateModalOpen(true);
              }}
            >
              Add Candidate
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              size="md"
              onClick={() => setJobModalOpen(true)}
            >
              Post Job Opening
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ATS Kanban Pipeline ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Active Job Requisitions ({jobs.length})</span>
        </button>
      </div>

      {/* Tab 1: ATS Kanban Board */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageApps = applications.filter((a) => a.status === stage);
            return (
              <div
                key={stage}
                className="bg-white rounded-3xl p-4 border border-neutral-200 flex flex-col min-h-[460px] shadow-xs"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-900">{stage}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stageBadgeColor(stage)}`}
                    >
                      {stageApps.length}
                    </span>
                  </div>
                </div>

                {/* Candidate Cards in Stage */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {stageApps.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-neutral-200 text-center text-[11px] text-neutral-400">
                      No candidates in {stage}
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app._id}
                        className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-black transition-all shadow-xs space-y-2 group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 group-hover:text-black transition-colors">
                              {app.applicantName}
                            </h4>
                            <p className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                              {app.job?.title || 'Tech Specialist'}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 text-neutral-800">
                            <Star className="w-3 h-3 fill-neutral-800" />
                            <span className="text-[10px] font-bold font-mono">{app.rating || 5}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-neutral-500 flex flex-col gap-0.5 pt-1 border-t border-neutral-200">
                          <span className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 text-neutral-400" />
                            {app.email}
                          </span>
                          {app.experienceYears && (
                            <span className="text-neutral-900 font-semibold">{app.experienceYears} yrs experience</span>
                          )}
                        </div>

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                          <span className="text-[9px] text-neutral-400 uppercase font-bold">Move:</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStage(app._id, e.target.value)}
                            className="bg-white border border-neutral-300 rounded-lg text-[10px] px-2 py-0.5 text-neutral-900 focus:outline-none focus:border-black font-medium"
                          >
                            {stages.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Job Requisitions */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bento-card p-6 flex flex-col justify-between group hover:border-black transition-all relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-300 mb-2">
                      {job.department?.name || 'Engineering'}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-black transition-colors">
                      {job.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      job.status === 'Active'
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    {job.location || 'Bengaluru / Hybrid'}
                  </span>
                  <span>&bull;</span>
                  <span>{job.experience || '3-6 yrs'}</span>
                </div>

                <p className="text-xs text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
                  {job.description || 'Key opening in our rapid-scaling product engineering team.'}
                </p>

                {/* Salary Package */}
                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Package Range:</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    ₹{(job.salaryRange?.min / 100000 || 18).toFixed(1)} - ₹
                    {(job.salaryRange?.max / 100000 || 32).toFixed(1)} LPA
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  Openings: <strong className="text-neutral-900">{job.openings || 1}</strong>
                </span>
                <span className="text-neutral-900 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {applications.filter((a) => a.job?._id === job._id || a.job === job._id).length} Applicants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title="Create New Job Requisition"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <Input
            label="Job Title"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            required
            placeholder="e.g. Staff Fullstack / Platform Architect"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <select
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs py-2.5 px-3 text-neutral-900 focus:outline-none focus:border-black"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Location / Office Hub"
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              placeholder="e.g. Bengaluru R&D Hub"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Package (₹ INR)"
              type="number"
              value={jobForm.salaryMin}
              onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
            />
            <Input
              label="Max Package (₹ INR)"
              type="number"
              value={jobForm.salaryMax}
              onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Role Description & Core Skills
            </label>
            <textarea
              rows={3}
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs p-3 text-neutral-900 focus:outline-none focus:border-black"
              placeholder="Key responsibilities, React/Node skills, performance benchmarks..."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200">
            <Button variant="secondary" size="sm" onClick={() => setJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={jobSubmitting}>
              Publish Job Opening
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={candidateModalOpen}
        onClose={() => setCandidateModalOpen(false)}
        title="Enroll Candidate to ATS Pipeline"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Target Requisition
            </label>
            <select
              value={candidateForm.job}
              onChange={(e) => setCandidateForm({ ...candidateForm, job: e.target.value })}
              required
              className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 text-xs py-2.5 px-3 text-neutral-900 focus:outline-none focus:border-black"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.department?.name})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Candidate Full Name"
            value={candidateForm.applicantName}
            onChange={(e) => setCandidateForm({ ...candidateForm, applicantName: e.target.value })}
            required
            placeholder="e.g. Siddharth Sengupta"
          />

          <Input
            label="Email Address"
            type="email"
            value={candidateForm.email}
            onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
            required
            placeholder="siddharth.s@talent.in"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={candidateForm.phone}
              onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Years Experience"
              type="number"
              value={candidateForm.experienceYears}
              onChange={(e) => setCandidateForm({ ...candidateForm, experienceYears: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200">
            <Button variant="secondary" size="sm" onClick={() => setCandidateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={candidateSubmitting}>
              Enroll Candidate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruitmentPage;
