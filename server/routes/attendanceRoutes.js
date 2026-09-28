const express = require('express');
const router = express.Router();
const {
  getAttendance,
  checkIn,
  checkOut,
  getTodayStatus,
  markAttendanceManual,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getAttendance);
router.get('/today', getTodayStatus);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/manual', authorize('admin'), markAttendanceManual);

module.exports = router;
