const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Job = require('../models/Job');
const Application = require('../models/Application');
const seedData = require('../config/seed');

// @desc    Get aggregate stats and analytics for dashboard
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Counts
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const totalApplicants = await Application.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // Today's attendance stats
    const todayAttendanceRecords = await Attendance.find({ date: today });
    const presentToday = todayAttendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const absentToday = todayAttendanceRecords.filter((a) => a.status === 'Absent').length;
    const onLeaveToday = todayAttendanceRecords.filter((a) => a.status === 'Leave').length;

    // Monthly payroll summary (current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const payrollRecords = await Payroll.find({ month: currentMonth, year: currentYear });
    const totalPayrollSpent = payrollRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);

    // Department employee breakdown for charts
    const departments = await Department.find();
    const departmentDistribution = await Promise.all(
      departments.map(async (d) => {
        const count = await Employee.countDocuments({ department: d._id, status: 'Active' });
        return {
          name: d.name,
          code: d.code,
          count,
        };
      })
    );

    // Attendance status distribution
    const attendanceSummary = [
      { name: 'Present', value: presentToday, color: '#10B981' },
      { name: 'Late', value: todayAttendanceRecords.filter((a) => a.status === 'Late').length, color: '#F59E0B' },
      { name: 'On Leave', value: onLeaveToday, color: '#6366F1' },
      { name: 'Absent / Unmarked', value: Math.max(0, totalEmployees - presentToday - onLeaveToday), color: '#EF4444' },
    ];

    // Recent activity (latest leaves, new hires, applications)
    const recentLeaves = await Leave.find()
      .populate('employee', 'firstName lastName designation profilePicture empCustomId')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentEmployees = await Employee.find({ status: 'Active' })
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    const recentApplications = await Application.find()
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(6);

    // Featured Hero Employee for Bento Card (e.g. Lead Designer / Engineer)
    const featuredEmployee = await Employee.findOne({ empCustomId: 'EMP-1001' }).populate('department')
      || (recentEmployees.length > 0 ? recentEmployees[0] : null);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          totalDepartments,
          activeJobs,
          totalApplicants,
          pendingLeaves,
          presentToday,
          absentToday,
          onLeaveToday,
          totalPayrollSpent,
          attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
        },
        featuredEmployee,
        departmentDistribution,
        attendanceSummary,
        recentLeaves,
        recentEmployees,
        recentApplications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get personal employee dashboard stats
// @route   GET /api/dashboard/employee-stats
// @access  Private
exports.getEmployeeDashboardStats = async (req, res, next) => {
  try {
    let employeeId = req.user.employeeId?._id || req.user.employeeId;
    if (!employeeId) {
      const emp = await Employee.findOne({ email: req.user.email });
      if (emp) employeeId = emp._id;
    }

    if (!employeeId) {
      return res.status(200).json({ success: true, data: null });
    }

    const employee = await Employee.findById(employeeId).populate('department');
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({ employee: employeeId, date: today });

    // Attendance stats this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const monthlyAttendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startOfMonth, $lte: today },
    });

    const daysPresent = monthlyAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const totalHoursWorked = monthlyAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

    // Recent leaves
    const recentLeaves = await Leave.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(5);
    const pendingLeaves = await Leave.countDocuments({ employee: employeeId, status: 'Pending' });

    // Recent payslips
    const recentPayslips = await Payroll.find({ employee: employeeId }).sort({ year: -1, month: -1 }).limit(3);

    res.status(200).json({
      success: true,
      data: {
        employee,
        todayAttendance,
        attendanceSummary: {
          daysPresent,
          totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
          attendancePercentage: 94,
        },
        pendingLeaves,
        recentLeaves,
        recentPayslips,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Force Reset and Seed Indian Demo Data
// @route   POST /api/dashboard/seed-reset
// @access  Private (Admin) or Secret
exports.resetSeedData = async (req, res, next) => {
  try {
    await seedData(true);
    res.status(200).json({
      success: true,
      message: 'All previous records removed. Fresh Indian HRMS database seeded successfully.',
    });
  } catch (err) {
    next(err);
  }
};
