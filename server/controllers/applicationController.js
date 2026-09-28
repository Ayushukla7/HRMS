const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin/HR)
exports.getApplications = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    const query = {};

    if (jobId && jobId !== 'all') {
      query.job = jobId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title department location',
        populate: { path: 'department', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create applicant / Apply for job
// @route   POST /api/applications
// @access  Public / Private
exports.createApplication = async (req, res, next) => {
  try {
    const application = await Application.create(req.body);

    const populated = await Application.findById(application._id).populate('job', 'title');

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Job Application',
        message: `${application.applicantName} applied for ${populated.job?.title || 'a position'}.`,
        type: 'recruitment',
        link: '/recruitment',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status / interview details
// @route   PUT /api/applications/:id/status
// @access  Private (Admin/HR)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, interviewDate, rating, notes } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) application.status = status;
    if (interviewDate !== undefined) application.interviewDate = interviewDate;
    if (rating !== undefined) application.rating = rating;
    if (notes !== undefined) application.notes = notes;

    await application.save();

    const populated = await Application.findById(application._id).populate('job', 'title');

    res.status(200).json({
      success: true,
      message: `Applicant stage updated to ${application.status}`,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Admin/HR)
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
