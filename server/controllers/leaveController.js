const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get all leave applications
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, employeeId } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      let empId = req.user.employeeId?._id || req.user.employeeId;
      if (!empId) {
        const emp = await Employee.findOne({ email: req.user.email });
        if (emp) {
          empId = emp._id;
          // Synchronize user.employeeId
          await User.findByIdAndUpdate(req.user._id, { employeeId: emp._id });
        }
      }

      if (!empId) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query.employee = empId;
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
        select: 'firstName lastName empCustomId designation profilePicture department email',
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
    let employeeId = req.body.employeeId || req.user.employeeId?._id || req.user.employeeId;

    // If employee profile is not explicitly linked, find by email or auto-provision
    if (!employeeId) {
      let employee = await Employee.findOne({ email: req.user.email });
      if (!employee) {
        const names = (req.user.name || 'Employee').trim().split(' ');
        const firstName = names[0] || 'Employee';
        const lastName = names.slice(1).join(' ') || 'Team';

        let defaultDept = await Department.findOne();
        if (!defaultDept) {
          defaultDept = await Department.create({
            name: 'Operations',
            code: 'OPS',
            description: 'Operations Department',
          });
        }

        const count = await Employee.countDocuments();
        const empCustomId = `EMP${String(count + 101).padStart(4, '0')}`;

        employee = await Employee.create({
          empCustomId,
          firstName,
          lastName,
          email: req.user.email,
          department: defaultDept._id,
          designation: 'Staff Member',
          salary: 65000,
          userAccount: req.user._id,
        });
      }

      employeeId = employee._id;
      await User.findByIdAndUpdate(req.user._id, { employeeId: employee._id });
    }

    // Calculate days count if not provided
    let calculatedDays = Number(daysCount);
    if (!calculatedDays || calculatedDays <= 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType: leaveType || 'Casual Leave',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      daysCount: calculatedDays,
      reason: reason || 'Personal Leave Request',
      documentUrl: documentUrl || '',
      status: 'Pending',
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        select: 'firstName lastName empCustomId designation profilePicture department email',
        populate: { path: 'department', select: 'name' },
      });

    const empName = populatedLeave?.employee
      ? `${populatedLeave.employee.firstName} ${populatedLeave.employee.lastName}`
      : (req.user.name || 'Employee');
    const empCode = populatedLeave?.employee?.empCustomId || 'Staff';

    // 1. Notify all HR / Admins with a real-time message notification
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Leave Request Received',
        message: `${empName} (${empCode}) requested ${calculatedDays} day(s) of ${leaveType || 'Casual Leave'} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.${reason ? ` Reason: "${reason}"` : ''}`,
        type: 'leave',
        link: '/leaves',
      });
    }

    // 2. Notify the submitting employee that their application is recorded
    await Notification.create({
      recipient: req.user._id,
      title: 'Leave Application Submitted',
      message: `Your application for ${calculatedDays} day(s) of ${leaveType} has been submitted to HR for approval.`,
      type: 'leave',
      link: '/leaves',
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully and sent to HR for approval.',
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

    // Find the user account belonging to the employee
    let recipientUserId = leave.employee?.userAccount;
    if (!recipientUserId && leave.employee?.email) {
      const userAcc = await User.findOne({ email: leave.employee.email });
      if (userAcc) recipientUserId = userAcc._id;
    }

    // Notify employee about approval / rejection
    if (recipientUserId) {
      await Notification.create({
        recipient: recipientUserId,
        title: `Leave Request ${status}`,
        message: `Your ${leave.leaveType} (${leave.daysCount} day(s)) has been ${status.toLowerCase()} by HR.${adminRemarks ? ` Note: "${adminRemarks}"` : ''}`,
        type: 'leave',
        link: '/leaves',
      });
    }

    const updatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        select: 'firstName lastName empCustomId designation profilePicture department email',
        populate: { path: 'department', select: 'name' },
      })
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: updatedLeave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leave balance quotas
// @route   GET /api/leaves/balance
// @access  Private
exports.getLeaveBalance = async (req, res, next) => {
  try {
    let employeeId = req.user.employeeId?._id || req.user.employeeId;
    if (!employeeId) {
      const emp = await Employee.findOne({ email: req.user.email });
      if (emp) employeeId = emp._id;
    }

    const quotas = [
      { leaveType: 'Casual Leave', totalQuota: 12 },
      { leaveType: 'Sick Leave', totalQuota: 10 },
      { leaveType: 'Earned Leave', totalQuota: 15 },
      { leaveType: 'Unpaid Leave', totalQuota: 30 },
    ];

    if (!employeeId) {
      const defaultBalances = quotas.map((q) => ({
        ...q,
        usedDays: 0,
        remainingDays: q.totalQuota,
      }));
      return res.status(200).json({ success: true, data: defaultBalances });
    }

    const approvedLeaves = await Leave.find({
      employee: employeeId,
      status: 'Approved',
      startDate: {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lte: new Date(new Date().getFullYear(), 11, 31),
      },
    });

    const balances = quotas.map((quota) => {
      const usedDays = approvedLeaves
        .filter((l) => l.leaveType === quota.leaveType)
        .reduce((sum, l) => sum + (l.daysCount || 0), 0);

      return {
        leaveType: quota.leaveType,
        totalQuota: quota.totalQuota,
        usedDays,
        remainingDays: Math.max(0, quota.totalQuota - usedDays),
      };
    });

    res.status(200).json({
      success: true,
      data: balances,
    });
  } catch (err) {
    next(err);
  }
};
