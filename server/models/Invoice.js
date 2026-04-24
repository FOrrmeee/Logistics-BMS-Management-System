const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  serialNumber: { type: String, unique: true },
  importerName: { type: String, required: true },
  bayan: { type: String, required: true },
  // ObjectId references to related documents
  shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  expenses: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  customsClearanceIncome: { type: Number, default: 0 },
  transportIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  totalPayments: { type: Number, default: 0 },
  toHassan: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
