const Shipment = require('../models/Shipment');

// @desc    Get all shipments
// @route   GET /api/shipments
const getShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shipment
// @route   GET /api/shipments/:id
const getShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    next(error);
  }
};

// @desc    Create shipment
// @route   POST /api/shipments
const createShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.create(req.body);
    res.status(201).json(shipment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update shipment
// @route   PUT /api/shipments/:id
const updateShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
const deleteShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique terminal names
// @route   GET /api/shipments/terminals
const getTerminals = async (req, res, next) => {
  try {
    // Get distinct non-empty terminals
    const terminals = await Shipment.distinct('terminal', { terminal: { $nin: [null, ''] } });
    res.json(terminals);
  } catch (error) {
    next(error);
  }
};

module.exports = { getShipments, getShipment, createShipment, updateShipment, deleteShipment, getTerminals };
