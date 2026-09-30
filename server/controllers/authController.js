const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_hrms_2026_pro_secure_token', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('employeeId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact HR.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employee: user.employeeId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employeeId',
      populate: { path: 'department' },
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile (including reactive avatar sync)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    // If linked to an employee profile, update employee picture & name as well
    if (user.employeeId) {
      const nameParts = (name || user.name).trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      await Employee.findByIdAndUpdate(user.employeeId, {
        profilePicture: avatar !== undefined ? avatar : undefined,
        firstName,
        lastName,
      });
    }

    const updatedUser = await User.findById(req.user._id).populate('employeeId');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        employee: updatedUser.employeeId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get live demo personas for login screen
// @route   GET /api/auth/demo-personas
// @access  Public
exports.getDemoPersonas = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .populate({
        path: 'employeeId',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ createdAt: 1 });

    const admin = users.find((u) => u.role === 'admin');
    const employees = users.filter((u) => u.role !== 'admin');

    const personas = [];

    if (admin) {
      personas.push({
        name: admin.name || 'Avinash Dev Dabas',
        role: 'HR Admin & Founder',
        email: admin.email,
        pass: 'admin123',
        badge: 'Admin',
        avatar: admin.avatar || 'https://i.pinimg.com/736x/a9/e5/a2/a9e5a2d5aaa1f28338356244a195a0b2.jpg',
      });
    }

    employees.forEach((empUser) => {
      const emp = empUser.employeeId || {};
      const deptName = emp.department?.name || 'Operations';
      const badge = deptName.includes('Design')
        ? 'Design'
        : deptName.includes('Tech') || deptName.includes('Eng')
        ? 'Tech'
        : deptName.includes('HR') || deptName.includes('People')
        ? 'HR Ops'
        : 'Staff';

      personas.push({
        name: emp.firstName ? `${emp.firstName} ${emp.lastName}` : empUser.name,
        role: emp.designation || 'Staff Member',
        email: empUser.email,
        pass: 'employee123',
        badge: badge,
        avatar: emp.profilePicture || empUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      });
    });

    res.status(200).json({
      success: true,
      data: personas,
    });
  } catch (err) {
    next(err);
  }
};

