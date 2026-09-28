const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public / Private
exports.getJobs = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    const jobs = await Job.find(query).populate('department', 'name code').sort({ createdAt: -1 });

    // Aggregate applicant counts
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      data: jobsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job with applicants
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('department');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applications = await Application.find({ job: job._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        applications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create job posting
// @route   POST /api/jobs
// @access  Private (Admin/HR)
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });

    const populated = await Job.findById(job._id).populate('department', 'name');

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Admin/HR)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin/HR)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Delete associated applications
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job and associated applications deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
