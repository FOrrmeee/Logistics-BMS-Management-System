const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  manifestNumber: { type: String },
  manifestDate: { type: Date },
  manifestType: { type: String },
  billNumber: { type: String },
  terminal: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
