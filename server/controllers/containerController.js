const Container = require('../models/Container');

// @desc    Get all containers
// @route   GET /api/containers
const getContainers = async (req, res, next) => {
  try {
    const containers = await Container.find().populate('shipment').sort({ createdAt: -1 });
    res.json(containers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single container
// @route   GET /api/containers/:id
const getContainer = async (req, res, next) => {
  try {
    const container = await Container.findById(req.params.id).populate('shipment');
    if (!container) return res.status(404).json({ message: 'Container not found' });
    res.json(container);
  } catch (error) {
    next(error);
  }
};

// @desc    Create container
// @route   POST /api/containers
const createContainer = async (req, res, next) => {
  try {
    const container = await Container.create(req.body);
    res.status(201).json(container);
  } catch (error) {
    next(error);
  }
};

// @desc    Update container
// @route   PUT /api/containers/:id
const updateContainer = async (req, res, next) => {
  try {
    const container = await Container.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!container) return res.status(404).json({ message: 'Container not found' });
    res.json(container);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete container
// @route   DELETE /api/containers/:id
const deleteContainer = async (req, res, next) => {
  try {
    const container = await Container.findByIdAndDelete(req.params.id);
    if (!container) return res.status(404).json({ message: 'Container not found' });
    res.json({ message: 'Container deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContainers, getContainer, createContainer, updateContainer, deleteContainer };
