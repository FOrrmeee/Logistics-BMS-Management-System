const Invoice = require('../models/Invoice');
const Container = require('../models/Container');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const invoices = await Invoice.find();
    const totalContainers = await Container.countDocuments();

    let totalInvoices = invoices.length;
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransporter = 0;
    let totalProfit = 0;

    const monthlyData = {};
    const dailyData = {};

    invoices.forEach(inv => {
      totalIncome += inv.totalIncome || 0;
      totalExpenses += inv.totalPayments || 0;
      totalTransporter += inv.toHassan || 0;
      totalProfit += inv.totalProfit || 0;

      const date = new Date(inv.date);

      // Monthly aggregation
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, profit: 0, income: 0, expenses: 0 };
      }
      monthlyData[month].profit += inv.totalProfit || 0;
      monthlyData[month].income += inv.totalIncome || 0;
      monthlyData[month].expenses += inv.totalPayments || 0;

      // Daily aggregation
      const day = date.toLocaleDateString('default', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!dailyData[day]) {
        dailyData[day] = { name: day, profit: 0, income: 0, expenses: 0, _date: date };
      }
      dailyData[day].profit += inv.totalProfit || 0;
      dailyData[day].income += inv.totalIncome || 0;
      dailyData[day].expenses += inv.totalPayments || 0;
    });

    // Sort daily data by actual date
    const chartData = Object.values(monthlyData);
    const dailyChartData = Object.values(dailyData)
      .sort((a, b) => a._date - b._date)
      .map(({ _date, ...rest }) => rest);

    res.json({
      totalInvoices,
      totalContainers,
      totalIncome,
      totalExpenses,
      totalTransporter,
      totalProfit,
      chartData,
      dailyChartData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
