const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/:id', getJobById);

router.use(protect);
router.post('/', authorize('admin'), createJob);
router.put('/:id', authorize('admin'), updateJob);
router.delete('/:id', authorize('admin'), deleteJob);

module.exports = router;
