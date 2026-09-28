const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get all employees with search & filter
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, employmentType, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { empCustomId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (employmentType && employmentType !== 'all') {
      query.employmentType = employmentType;
    }

    const count = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .sort(sort ? { [sort]: 1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('userAccount', 'name email role lastLogin avatar');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/HR)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      joiningDate,
      salary,
      address,
      profilePicture,
      employmentType,
      status,
      gender,
      dateOfBirth,
      bankDetails,
      createUserAccount,
      password,
      role,
    } = req.body;

    // Generate custom employee ID if not provided
    let empCustomId = req.body.empCustomId;
    if (!empCustomId) {
      const count = await Employee.countDocuments();
      empCustomId = `EMP-${(count + 1).toString().padStart(4, '0')}`;
    }

    const employee = new Employee({
      empCustomId,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      joiningDate: joiningDate || Date.now(),
      salary,
      address,
      profilePicture: profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}_${lastName}`,
      employmentType: employmentType || 'Full-Time',
      status: status || 'Active',
      gender,
      dateOfBirth,
      bankDetails,
    });

    await employee.save();

    // Optionally create user account for portal login
    if (createUserAccount || email) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const user = await User.create({
          name: `${firstName} ${lastName}`,
          email,
          password: password || 'Password123!',
          role: role || 'employee',
          employeeId: employee._id,
          avatar: employee.profilePicture,
        });
        employee.userAccount = user._id;
        await employee.save();
      } else {
        existingUser.employeeId = employee._id;
        await existingUser.save();
        employee.userAccount = existingUser._id;
        await employee.save();
      }
    }

    const populatedEmployee = await Employee.findById(employee._id).populate('department');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populatedEmployee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/HR)
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department');

    // Also update associated user name/avatar if exists
    if (employee.userAccount) {
      await User.findByIdAndUpdate(employee.userAccount, {
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        avatar: employee.profilePicture,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin/HR)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete linked user account if exists
    if (employee.userAccount) {
      await User.findByIdAndDelete(employee.userAccount);
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
