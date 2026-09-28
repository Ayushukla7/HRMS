const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Get performance reviews
// @route   GET /api/performance
// @access  Private
exports.getPerformanceReviews = async (req, res, next) => {
  try {
    const { employeeId, reviewPeriod } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      if (!req.user.employeeId) {
        return res.status(200).json({ success: true, data: [] });
      }
      query.employee = req.user.employeeId._id || req.user.employeeId;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (reviewPeriod && reviewPeriod !== 'all') {
      query.reviewPeriod = reviewPeriod;
    }

    const reviews = await Performance.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName empCustomId designation profilePicture department',
        populate: { path: 'department', select: 'name' }
      })
      .populate('reviewer', 'name email role')
      .sort({ reviewDate: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for specific employee
// @route   GET /api/performance/:employeeId
// @access  Private
exports.getEmployeeReviews = async (req, res, next) => {
  try {
    const reviews = await Performance.find({ employee: req.params.employeeId })
      .populate('reviewer', 'name email')
      .sort({ reviewDate: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create performance review
// @route   POST /api/performance
// @access  Private (Admin/HR)
exports.createPerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.create({
      ...req.body,
      reviewer: req.user._id,
    });

    const populated = await Performance.findById(review._id)
      .populate('employee', 'firstName lastName userAccount')
      .populate('reviewer', 'name');

    // Notify employee about review
    if (populated.employee && populated.employee.userAccount) {
      await Notification.create({
        recipient: populated.employee.userAccount,
        title: 'Performance Review Completed',
        message: `Your appraisal review for ${review.reviewPeriod} has been submitted with a rating of ${review.rating}/5.`,
        type: 'performance',
        link: '/performance',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Performance review submitted successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private (Admin/HR)
exports.updatePerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('employee', 'firstName lastName')
      .populate('reviewer', 'name');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Performance review updated successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add employee comments to review
// @route   POST /api/performance/:id/comments
// @access  Private
exports.addEmployeeComments = async (req, res, next) => {
  try {
    const { employeeComments } = req.body;
    const review = await Performance.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.employeeComments = employeeComments;
    review.status = 'Acknowledged';
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Comments and acknowledgment saved',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
