const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment,
  getTerminals
} = require('../controllers/shipmentController');

router.get('/terminals', protect, getTerminals);

router.route('/').get(protect, getShipments).post(protect, createShipment);
router.route('/:id').get(protect, getShipment).put(protect, updateShipment).delete(protect, deleteShipment);

module.exports = router;
