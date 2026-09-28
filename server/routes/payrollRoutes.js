const express = require('express');
const router = express.Router();
const {
  getPayroll,
  getPayrollById,
  createPayroll,
  bulkGeneratePayroll,
  deletePayroll,
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPayroll)
  .post(authorize('admin'), createPayroll);

router.post('/bulk-generate', authorize('admin'), bulkGeneratePayroll);

router.route('/:id')
  .get(getPayrollById)
  .delete(authorize('admin'), deletePayroll);

module.exports = router;
