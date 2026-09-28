const express = require('express');
const router = express.Router();
const {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  getLeaveBalance,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.get('/balance/:employeeId?', getLeaveBalance);
router.put('/:id/status', authorize('admin'), updateLeaveStatus);

module.exports = router;
