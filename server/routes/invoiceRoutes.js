const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber,
  getImporterNames,
  getBayanNumbers
} = require('../controllers/invoiceController');

// Get next auto-generated invoice number (must be before /:id route)
router.get('/next-number', protect, getNextInvoiceNumber);
router.get('/importers', protect, getImporterNames);
router.get('/bayans', protect, getBayanNumbers);

router.route('/').get(protect, getInvoices).post(protect, createInvoice);
router.route('/:id').get(protect, getInvoice).put(protect, updateInvoice).delete(protect, deleteInvoice);

module.exports = router;
