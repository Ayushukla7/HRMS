const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empCustomId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    default: Date.now,
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0,
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'USA' },
  },
  profilePicture: {
    type: String,
    default: '',
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
    default: 'Full-Time',
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated', 'Resigned'],
    default: 'Active',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say',
  },
  dateOfBirth: {
    type: Date,
  },
  bankDetails: {
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    panNumber: { type: String, default: '' },
  },
  userAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
