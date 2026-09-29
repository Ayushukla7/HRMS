import React, { useState, useEffect } from 'react';
import { jobApi, applicationApi, departmentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  UserPlus,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  Star,
  Calendar,
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
    location: 'Remote / Hybrid',
    employmentType: 'Full-Time',
    experience: '2-4 years',
    salaryMin: 90000,
    salaryMax: 130000,
    description: '',
    openings: 1,
    status: 'Active',
  });

  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [candidateSubmitting, setCandidateSubmitting] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    job: '',
    applicantName: '',
    email: '',
    phone: '',
    experienceYears: 3,
    coverLetter: '',
    status: 'Applied',
    rating: 4,
    notes: '',
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
        salaryRange: { min: Number(jobForm.salaryMin), max: Number(jobForm.salaryMax), currency: 'USD' },
      });
      showToast('Job posting published successfully', 'success');
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
      showToast('Candidate added to applicant tracking pipeline', 'success');
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
    return <LoadingSpinner text="Loading recruitment ATS pipeline..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Recruitment & ATS</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Post job requisitions, track candidate stages across Kanban pipelines, and streamline hiring.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              icon={UserPlus}
              size="sm"
              onClick={() => {
                if (jobs.length > 0) {
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
              size="sm"
              onClick={() => setJobModalOpen(true)}
            >
              Post New Job
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'pipeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Candidate Pipeline Kanban ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Job Postings ({jobs.length})
        </button>
      </div>

      {/* TAB 1: KANBAN PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageApplicants = applications.filter((a) => a.status === stage);

            return (
              <div
                key={stage}
                className="bg-slate-100/80 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {stage}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    {stageApplicants.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageApplicants.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No candidates
                    </div>
                  ) : (
                    stageApplicants.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                            {app.applicantName}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {app.rating || 4}
                          </span>
                        </div>

                        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                          {app.job?.title || 'Open Position'}
                        </p>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Exp: {app.experienceYears} yrs • {app.email}
                        </p>

                        {app.notes && (
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                            {app.notes}
                          </p>
                        )}

                        {/* Stage Selector Dropdown */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStage(app._id, e.target.value)}
                            className="w-full text-[10px] font-medium py-1 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {stages.map((st) => (
                              <option key={st} value={st}>
                                Move to {st}
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

      {/* TAB 2: JOB OPENINGS LIST */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <Badge variant={job.status}>{job.status}</Badge>
                </div>

                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {job.department?.name || 'Department'} • {job.employmentType}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {job.experience}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Salary Range</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${job.salaryRange?.min ? (job.salaryRange.min / 1000).toFixed(0) + 'k' : '90k'} - $
                    {job.salaryRange?.max ? (job.salaryRange.max / 1000).toFixed(0) + 'k' : '130k'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Applicants</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{job.applicantCount || 0} Candidates</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title="Create Job Requisition"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <Input
            label="Job Title"
            name="title"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            required
            placeholder="e.g. Senior Frontend Engineer"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <select
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                required
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Location"
              name="location"
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              placeholder="San Francisco, CA or Remote"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Experience Required"
              name="experience"
              value={jobForm.experience}
              onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
              placeholder="3-5 years"
            />
            <Input
              label="Open Vacancies"
              type="number"
              name="openings"
              value={jobForm.openings}
              onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Salary ($/yr)"
              type="number"
              name="salaryMin"
              value={jobForm.salaryMin}
              onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
            />
            <Input
              label="Max Salary ($/yr)"
              type="number"
              name="salaryMax"
              value={jobForm.salaryMax}
              onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Job Description & Responsibilities <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Detail key responsibilities, technical requirements, and expectations for this role..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={jobSubmitting}>
              Publish Job Requisition
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={candidateModalOpen}
        onClose={() => setCandidateModalOpen(false)}
        title="Add Candidate to ATS Pipeline"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Applying For Role
            </label>
            <select
              value={candidateForm.job}
              onChange={(e) => setCandidateForm({ ...candidateForm, job: e.target.value })}
              required
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            name="applicantName"
            value={candidateForm.applicantName}
            onChange={(e) => setCandidateForm({ ...candidateForm, applicantName: e.target.value })}
            required
            placeholder="Jane Doe"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              name="email"
              value={candidateForm.email}
              onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
              required
              placeholder="jane.doe@email.com"
            />
            <Input
              label="Phone"
              name="phone"
              value={candidateForm.phone}
              onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Years Experience"
              type="number"
              name="experienceYears"
              value={candidateForm.experienceYears}
              onChange={(e) => setCandidateForm({ ...candidateForm, experienceYears: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Initial Stage
              </label>
              <select
                value={candidateForm.status}
                onChange={(e) => setCandidateForm({ ...candidateForm, status: e.target.value })}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stages.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Evaluator Notes / Screener Feedback"
            name="notes"
            value={candidateForm.notes}
            onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
            placeholder="e.g. Strong React and system architecture skills"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setCandidateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={candidateSubmitting}>
              Add Candidate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruitmentPage;
