const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD for easy querying
    required: true,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Late', 'Holiday'],
    default: 'Present',
  },
  workHours: {
    type: Number, // in hours e.g. 8.5
    default: 0,
  },
  location: {
    type: String,
    default: 'Office',
  },
  notes: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
  }
}, {
  timestamps: true,
});

// Ensure unique attendance entry per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
