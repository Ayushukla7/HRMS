const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Get all payroll entries
// @route   GET /api/payroll
// @access  Private
exports.getPayroll = async (req, res, next) => {
  try {
    const { month, year, employeeId, paymentStatus } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      if (!req.user.employeeId) {
        return res.status(200).json({ success: true, data: [] });
      }
      query.employee = req.user.employeeId._id || req.user.employeeId;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (month && month !== 'all') {
      query.month = month;
    }

    if (year) {
      query.year = Number(year);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    const records = await Payroll.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName empCustomId designation department email phone bankDetails',
        populate: { path: 'department', select: 'name' }
      })
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private
exports.getPayrollById = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate({
      path: 'employee',
      populate: { path: 'department' }
    });

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create/generate payroll entry
// @route   POST /api/payroll
// @access  Private (Admin/HR)
exports.createPayroll = async (req, res, next) => {
  try {
    const {
      employeeId,
      month,
      year,
      basicSalary,
      allowances = {},
      deductions = {},
      bonus = 0,
      paymentMethod = 'Bank Transfer',
      notes,
    } = req.body;

    const totalAllowances =
      (Number(allowances.hra) || 0) +
      (Number(allowances.da) || 0) +
      (Number(allowances.conveyance) || 0) +
      (Number(allowances.medical) || 0) +
      (Number(allowances.special) || 0);

    const totalDeductions =
      (Number(deductions.providentFund) || 0) +
      (Number(deductions.tax) || 0) +
      (Number(deductions.insurance) || 0) +
      (Number(deductions.unpaidLeaveDeduction) || 0);

    const grossSalary = Number(basicSalary) + totalAllowances + Number(bonus);
    const netSalary = grossSalary - totalDeductions;

    // Check if payroll already exists for this employee, month, year
    let payroll = await Payroll.findOne({ employee: employeeId, month, year });

    if (payroll) {
      payroll.basicSalary = basicSalary;
      payroll.allowances = allowances;
      payroll.deductions = deductions;
      payroll.bonus = bonus;
      payroll.grossSalary = grossSalary;
      payroll.totalDeductions = totalDeductions;
      payroll.netSalary = netSalary;
      payroll.paymentMethod = paymentMethod;
      payroll.notes = notes;
      await payroll.save();
    } else {
      payroll = await Payroll.create({
        employee: employeeId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        bonus,
        grossSalary,
        totalDeductions,
        netSalary,
        paymentStatus: 'Paid',
        paymentMethod,
        payDate: new Date(),
        notes,
      });
    }

    const populated = await Payroll.findById(payroll._id).populate('employee');

    // Notify employee about salary credit / payslip
    if (populated.employee && populated.employee.userAccount) {
      await Notification.create({
        recipient: populated.employee.userAccount,
        title: 'Payslip Available',
        message: `Your payslip for ${month} ${year} of amount $${netSalary.toLocaleString()} is now ready to view.`,
        type: 'payroll',
        link: '/payroll',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk generate payroll for all active employees for a month
// @route   POST /api/payroll/bulk-generate
// @access  Private (Admin/HR)
exports.bulkGeneratePayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    const employees = await Employee.find({ status: 'Active' });
    let createdCount = 0;

    for (const emp of employees) {
      const basic = emp.salary || 4000;
      // standard formula: HRA = 20%, Conveyance = $200, Medical = $150
      const hra = Math.round(basic * 0.20);
      const conveyance = 200;
      const medical = 150;
      const allowances = { hra, da: 0, conveyance, medical, special: 100 };

      // standard deductions: PF = 5%, Tax = 10%, Insurance = $100
      const pf = Math.round(basic * 0.05);
      const tax = Math.round(basic * 0.10);
      const insurance = 100;
      const deductions = { providentFund: pf, tax, insurance, unpaidLeaveDeduction: 0 };

      const totalAllowances = hra + conveyance + medical + 100;
      const totalDeductions = pf + tax + insurance;
      const grossSalary = basic + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      await Payroll.findOneAndUpdate(
        { employee: emp._id, month, year },
        {
          employee: emp._id,
          month,
          year,
          basicSalary: basic,
          allowances,
          deductions,
          bonus: 0,
          grossSalary,
          totalDeductions,
          netSalary,
          paymentStatus: 'Paid',
          paymentMethod: 'Bank Transfer',
          payDate: new Date(),
        },
        { upsert: true, new: true }
      );
      createdCount++;
    }

    res.status(200).json({
      success: true,
      message: `Bulk payroll generated successfully for ${createdCount} employees.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private (Admin/HR)
exports.deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
