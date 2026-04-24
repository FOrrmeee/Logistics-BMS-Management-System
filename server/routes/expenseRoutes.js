const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

router.route('/').get(protect, getExpenses).post(protect, createExpense);
router.route('/:id').get(protect, getExpense).put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;
