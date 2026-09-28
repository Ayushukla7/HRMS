const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewPeriod: {
    type: String, // e.g. "Q1 2026" or "Annual 2025"
    required: true,
  },
  goals: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    weightage: { type: Number, default: 20 },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Exceeded'],
      default: 'In Progress',
    },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  }],
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    required: [true, 'Feedback is required'],
  },
  achievements: {
    type: String,
    default: '',
  },
  areasOfImprovement: {
    type: String,
    default: '',
  },
  reviewDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Acknowledged'],
    default: 'Submitted',
  },
  employeeComments: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Performance', performanceSchema);
