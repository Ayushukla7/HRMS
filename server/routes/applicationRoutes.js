const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createApplication); // Public application submission

router.use(protect);
router.get('/', authorize('admin'), getApplications);
router.put('/:id/status', authorize('admin'), updateApplicationStatus);
router.delete('/:id', authorize('admin'), deleteApplication);

module.exports = router;
