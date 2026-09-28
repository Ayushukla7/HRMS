const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getEmployeeDashboardStats,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('admin'), getDashboardStats);
router.get('/employee-stats', getEmployeeDashboardStats);

module.exports = router;
