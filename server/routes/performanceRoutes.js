const express = require('express');
const router = express.Router();
const {
  getPerformanceReviews,
  getEmployeeReviews,
  createPerformanceReview,
  updatePerformanceReview,
  addEmployeeComments,
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPerformanceReviews)
  .post(authorize('admin'), createPerformanceReview);

router.get('/employee/:employeeId', getEmployeeReviews);
router.put('/:id', authorize('admin'), updatePerformanceReview);
router.post('/:id/comments', addEmployeeComments);

module.exports = router;
