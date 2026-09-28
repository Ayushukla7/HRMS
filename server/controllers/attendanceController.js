const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to get today's date in YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// @desc    Get attendance records (Admin views all, Employee views own)
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { date, startDate, endDate, employeeId, departmentId, status } = req.query;

    const query = {};

    // If employee role, restrict to their own employee ID
    if (req.user.role === 'employee') {
      if (!req.user.employeeId) {
        return res.status(200).json({ success: true, data: [] });
      }
      query.employee = req.user.employeeId._id || req.user.employeeId;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'empCustomId firstName lastName designation profilePicture department',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ date: -1, createdAt: -1 });

    if (departmentId && departmentId !== 'all') {
      attendanceRecords = attendanceRecords.filter(
        (rec) => rec.employee && rec.employee.department && rec.employee.department._id.toString() === departmentId
      );
    }

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-In for logged in employee
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res, next) => {
  try {
    const employeeId = req.body.employeeId || req.user.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to this user' });
    }

    const today = getTodayDateString();
    let record = await Attendance.findOne({ employee: employeeId, date: today });

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: `Already checked in today at ${new Date(record.checkIn).toLocaleTimeString()}`,
        data: record,
      });
    }

    const now = new Date();
    // Consider late if after 9:30 AM
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

    if (!record) {
      record = new Attendance({
        employee: employeeId,
        date: today,
        checkIn: now,
        status: isLate ? 'Late' : 'Present',
        location: req.body.location || 'Office',
        notes: req.body.notes || '',
      });
    } else {
      record.checkIn = now;
      record.status = isLate ? 'Late' : 'Present';
      if (req.body.location) record.location = req.body.location;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-Out for logged in employee
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const employeeId = req.body.employeeId || req.user.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked' });
    }

    const today = getTodayDateString();
    const record = await Attendance.findOne({ employee: employeeId, date: today });

    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'You have not checked in yet today' });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: `Already checked out today at ${new Date(record.checkOut).toLocaleTimeString()}`,
        data: record,
      });
    }

    const now = new Date();
    record.checkOut = now;

    // Calculate work hours
    const diffMs = now - new Date(record.checkIn);
    const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    record.workHours = parseFloat(hours);

    // If worked less than 4 hours, mark as Half Day
    if (record.workHours < 4 && record.status === 'Present') {
      record.status = 'Half Day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Total hours: ${hours} hrs`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayStatus = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId?._id || req.user.employeeId;
    if (!employeeId) {
      return res.status(200).json({ success: true, data: null });
    }

    const today = getTodayDateString();
    const record = await Attendance.findOne({ employee: employeeId, date: today });

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin manual mark/update attendance
// @route   POST /api/attendance/manual
// @access  Private (Admin/HR)
exports.markAttendanceManual = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, workHours, notes } = req.body;

    let record = await Attendance.findOne({ employee: employeeId, date });

    if (!record) {
      record = new Attendance({
        employee: employeeId,
        date,
        status,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        workHours: workHours || (status === 'Present' ? 8 : 0),
        notes,
      });
    } else {
      if (status) record.status = status;
      if (checkIn) record.checkIn = new Date(checkIn);
      if (checkOut) record.checkOut = new Date(checkOut);
      if (workHours !== undefined) record.workHours = workHours;
      if (notes !== undefined) record.notes = notes;
    }

    await record.save();

    const populated = await Attendance.findById(record._id).populate('employee', 'firstName lastName empCustomId');

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};
