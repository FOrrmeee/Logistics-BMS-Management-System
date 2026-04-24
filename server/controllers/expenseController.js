const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');

// @desc    Get all expenses
// @route   GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense (auto-calculates totalPayments)
// @route   POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const totalPayments =
      (Number(req.body.agentFees) || 0) +
      (Number(req.body.portFees) || 0) +
      (Number(req.body.wagesPortsAuthority) || 0) +
      (Number(req.body.appointmentFees) || 0) +
      (Number(req.body.customsClearanceFees) || 0) +
      (Number(req.body.transportationFees) || 0) +
      (Number(req.body.fines) || 0) +
      (Number(req.body.transferToAgent) || 0);

    const expense = await Expense.create({ ...req.body, totalPayments });

    // Sync to related Invoice if matched by Bayan
    if (expense.bayan) {
      const invoice = await Invoice.findOne({ bayan: expense.bayan });
      if (invoice) {
        invoice.toHassan = expense.toTransporter || 0;
        invoice.totalPayments = expense.totalPayments || 0;
        invoice.totalProfit = (invoice.totalIncome || 0) - invoice.toHassan;
        await invoice.save();
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense (auto-recalculates totalPayments)
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const totalPayments =
      (Number(req.body.agentFees) || 0) +
      (Number(req.body.portFees) || 0) +
      (Number(req.body.wagesPortsAuthority) || 0) +
      (Number(req.body.appointmentFees) || 0) +
      (Number(req.body.customsClearanceFees) || 0) +
      (Number(req.body.transportationFees) || 0) +
      (Number(req.body.fines) || 0) +
      (Number(req.body.transferToAgent) || 0);

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, totalPayments },
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Sync to related Invoice (by expense reference or Bayan)
    const invoice = await Invoice.findOne({ $or: [{ expenses: expense._id }, { bayan: expense.bayan }] });
    if (invoice) {
      invoice.toHassan = expense.toTransporter || 0;
      invoice.totalPayments = expense.totalPayments || 0;
      invoice.totalProfit = (invoice.totalIncome || 0) - invoice.toHassan;
      await invoice.save();
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense };
