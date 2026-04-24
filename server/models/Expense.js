const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  bayan: { type: String, default: '' },
  agentFees: { type: Number, default: 0 },
  portFees: { type: Number, default: 0 },
  wagesPortsAuthority: { type: Number, default: 0 },
  appointmentFees: { type: Number, default: 0 },
  fines: { type: Number, default: 0 },
  transferToAgent: { type: Number, default: 0 },
  customsClearanceFees: { type: Number, default: 0 },
  transportationFees: { type: Number, default: 0 },
  toTransporter: { type: Number, default: 0 },
  // Auto-calculated total (excludes toTransporter)
  totalPayments: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to auto-calculate totalPayments (excludes toTransporter)
expenseSchema.pre('save', function(next) {
  this.totalPayments =
    (this.agentFees || 0) +
    (this.portFees || 0) +
    (this.wagesPortsAuthority || 0) +
    (this.appointmentFees || 0) +
    (this.fines || 0) +
    (this.transferToAgent || 0) +
    (this.customsClearanceFees || 0) +
    (this.transportationFees || 0);
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
