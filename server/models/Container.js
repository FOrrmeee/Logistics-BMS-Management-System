const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
  containerNumber: { type: String },
  size: { type: String },
  numberOfContainers: { type: Number, default: 1 },
  country: { type: String },
  bayan: { type: String },
  customer: { type: String },
  // Reference to the shipment this container belongs to
  shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }
}, { timestamps: true });

module.exports = mongoose.model('Container', containerSchema);
