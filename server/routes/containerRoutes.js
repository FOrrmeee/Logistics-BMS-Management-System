const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getContainers,
  getContainer,
  createContainer,
  updateContainer,
  deleteContainer
} = require('../controllers/containerController');

router.route('/').get(protect, getContainers).post(protect, createContainer);
router.route('/:id').get(protect, getContainer).put(protect, updateContainer).delete(protect, deleteContainer);

module.exports = router;
