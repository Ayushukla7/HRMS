const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments with employee counts
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('headOfDepartment', 'firstName lastName email designation profilePicture');

    // Aggregate employee count for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithCounts.length,
      data: departmentsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('headOfDepartment');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const employees = await Employee.find({ department: department._id });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        employees,
        employeeCount: employees.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin/HR)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment, budget, location } = req.body;

    const exists = await Department.findOne({
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headOfDepartment: headOfDepartment || null,
      budget: budget || 0,
      location: location || 'Main Office',
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin/HR)
exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('headOfDepartment');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin/HR)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const employeesInDept = await Employee.countDocuments({ department: req.params.id });
    if (employeesInDept > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${employeesInDept} employee(s) assigned to it.`
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
