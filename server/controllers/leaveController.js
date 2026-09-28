const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all leave applications
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, employeeId } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      if (!req.user.employeeId) {
        return res.status(200).json({ success: true, data: [] });
      }
      query.employee = req.user.employeeId._id || req.user.employeeId;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    const leaves = await Leave.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName empCustomId designation profilePicture department',
        populate: { path: 'department', select: 'name' },
      })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, daysCount, reason, documentUrl } = req.body;
    const employeeId = req.body.employeeId || req.user.employeeId?._id || req.user.employeeId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to account' });
    }

    // Calculate days count if not provided
    let calculatedDays = daysCount;
    if (!calculatedDays) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      daysCount: calculatedDays,
      reason,
      documentUrl: documentUrl || '',
      status: 'Pending',
    });

    const populatedLeave = await Leave.findById(leave._id).populate('employee', 'firstName lastName empCustomId');

    // Notify Admins about new leave request
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Leave Request',
        message: `${populatedLeave.employee.firstName} ${populatedLeave.employee.lastName} applied for ${calculatedDays} day(s) ${leaveType}.`,
        type: 'leave',
        link: '/leaves',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update leave status (Approve / Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin/HR)
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!['Approved', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || '';
    leave.approvedBy = req.user._id;
    leave.decisionDate = new Date();

    await leave.save();

    // Notify employee about approval / rejection
    if (leave.employee && leave.employee.userAccount) {
      await Notification.create({
        recipient: leave.employee.userAccount,
        title: `Leave Request ${status}`,
        message: `Your ${leave.leaveType} from ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()}.${adminRemarks ? ` Remarks: ${adminRemarks}` : ''}`,
        type: 'leave',
        link: '/leaves',
      });
    }

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName empCustomId')
      .populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: updatedLeave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leave balance summary for an employee
// @route   GET /api/leaves/balance/:employeeId?
// @access  Private
exports.getLeaveBalance = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId || req.user.employeeId?._id || req.user.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID required' });
    }

    const approvedLeaves = await Leave.find({
      employee: employeeId,
      status: 'Approved',
      startDate: { $gte: new Date(new Date().getFullYear(), 0, 1) },
    });

    const standardQuotas = {
      'Casual Leave': 12,
      'Sick Leave': 10,
      'Earned Leave': 15,
      'Maternity Leave': 90,
      'Paternity Leave': 10,
      'Unpaid Leave': 30,
    };

    const used = {};
    for (const key of Object.keys(standardQuotas)) {
      used[key] = 0;
    }

    approvedLeaves.forEach((l) => {
      if (used[l.leaveType] !== undefined) {
        used[l.leaveType] += l.daysCount;
      }
    });

    const summary = Object.keys(standardQuotas).map((type) => ({
      leaveType: type,
      totalQuota: standardQuotas[type],
      usedDays: used[type] || 0,
      remainingDays: Math.max(0, standardQuotas[type] - (used[type] || 0)),
    }));

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};
