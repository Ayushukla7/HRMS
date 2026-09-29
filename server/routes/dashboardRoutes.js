const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getEmployeeDashboardStats,
  resetSeedData,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Public or Protected reset endpoint
router.post('/seed-reset', protect, authorize('admin'), resetSeedData);
router.get('/public-seed-reset', resetSeedData);

router.use(protect);
router.get('/stats', authorize('admin'), getDashboardStats);
router.get('/employee-stats', getEmployeeDashboardStats);

module.exports = router;
