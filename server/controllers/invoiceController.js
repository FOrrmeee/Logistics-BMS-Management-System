const Invoice = require('../models/Invoice');
const Shipment = require('../models/Shipment');
const Container = require('../models/Container');
const Expense = require('../models/Expense');

// Helper: auto-generate invoice number (INV-YYYYMMDD-XXX)
const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;
  
  // Find the latest invoice with this date prefix
  const lastInvoice = await Invoice.findOne({ invoiceNumber: { $regex: `^${prefix}` } })
    .sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-').pop());
    sequence = lastSeq + 1;
  }
  
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// Helper: auto-generate serial number (SN-0001, SN-0002, ...)
const generateSerialNumber = async () => {
  const lastInvoice = await Invoice.findOne({ serialNumber: { $regex: /^SN-/ } })
    .sort({ serialNumber: -1 });

  let sequence = 1;
  if (lastInvoice && lastInvoice.serialNumber) {
    const lastSeq = parseInt(lastInvoice.serialNumber.split('-')[1]);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `SN-${String(sequence).padStart(4, '0')}`;
};

// Helper: calculate total payments from expense fields
const calcTotalPayments = (exp) => {
  return (Number(exp.agentFees) || 0) +
         (Number(exp.portFees) || 0) +
         (Number(exp.wagesPortsAuthority) || 0) +
         (Number(exp.appointmentFees) || 0) +
         (Number(exp.fines) || 0) +
         (Number(exp.transferToAgent) || 0);
};

// @desc    Get all invoices
// @route   GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { search, startDate, endDate } = req.query;
    let filter = {};

    // Search by importer name, invoice number, serial number or bayan number
    if (search) {
      filter.$or = [
        { importerName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { bayan: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(filter)
      .populate('shipment')
      .populate('expenses')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice with all related data
// @route   GET /api/invoices/:id
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('shipment')
      .populate('expenses');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Also fetch containers linked to this invoice's shipment
    let containers = [];
    if (invoice.shipment) {
      containers = await Container.find({ shipment: invoice.shipment._id });
    }

    res.json({ invoice, containers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create invoice with related shipment, containers, expenses
// @route   POST /api/invoices
const createInvoice = async (req, res, next) => {
  try {
    const { invoiceData, shipmentData, containerData, expenseData } = req.body;

    // Auto-generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await generateInvoiceNumber();
    }

    // Auto-generate serial number if not provided
    if (!invoiceData.serialNumber) {
      invoiceData.serialNumber = await generateSerialNumber();
    }

    // Create expense first if provided
    let savedExpense = null;
    let totalPayments = 0;
    if (expenseData) {
      expenseData.toTransporter = invoiceData.toHassan || 0; // Sync from invoice
      expenseData.bayan = invoiceData.bayan || ''; // Sync bayan number
      totalPayments = calcTotalPayments(expenseData);
      savedExpense = await new Expense({ ...expenseData, totalPayments }).save();
    }

    // Create shipment if provided
    let savedShipment = null;
    if (shipmentData) {
      savedShipment = await new Shipment(shipmentData).save();
    }

    // Calculate profit: Total Income - To Hassan
    const totalIncome = Number(invoiceData.totalIncome) || 0;
    const toHassan = Number(invoiceData.toHassan) || 0;
    const totalProfit = totalIncome - toHassan;

    // Create the invoice with references
    const newInvoice = new Invoice({
      ...invoiceData,
      shipment: savedShipment ? savedShipment._id : null,
      expenses: savedExpense ? savedExpense._id : null,
      totalPayments,
      totalProfit
    });

    const savedInvoice = await newInvoice.save();

    // Create containers linked to shipment
    let savedContainers = [];
    if (containerData && savedShipment) {
      if (Array.isArray(containerData)) {
        for (const c of containerData) {
          const sc = await new Container({ ...c, shipment: savedShipment._id, bayan: invoiceData.bayan || '' }).save();
          savedContainers.push(sc);
        }
      } else {
        const sc = await new Container({ ...containerData, shipment: savedShipment._id, bayan: invoiceData.bayan || '' }).save();
        savedContainers.push(sc);
      }
    }

    res.status(201).json({
      invoice: savedInvoice,
      shipment: savedShipment,
      containers: savedContainers,
      expense: savedExpense
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists. Please use a unique number.' });
    }
    next(error);
  }
};

// @desc    Update invoice with related data
// @route   PUT /api/invoices/:id
const updateInvoice = async (req, res, next) => {
  try {
    const { invoiceData, shipmentData, containerData, expenseData } = req.body;
    const existingInvoice = await Invoice.findById(req.params.id);
    if (!existingInvoice) return res.status(404).json({ message: 'Invoice not found' });

    // Serial number is unchangeable after creation - always preserve original
    delete invoiceData.serialNumber;

    // Update expense
    let totalPayments = 0;
    let updatedExpense = null;
    if (expenseData) {
      expenseData.toTransporter = invoiceData.toHassan || 0; // Sync from invoice
      expenseData.bayan = invoiceData.bayan || ''; // Sync bayan number
      totalPayments = calcTotalPayments(expenseData);
      if (existingInvoice.expenses) {
        updatedExpense = await Expense.findByIdAndUpdate(
          existingInvoice.expenses,
          { ...expenseData, totalPayments },
          { new: true }
        );
      } else {
        updatedExpense = await new Expense({ ...expenseData, totalPayments }).save();
      }
    }

    // Update shipment
    let updatedShipment = null;
    if (shipmentData) {
      if (existingInvoice.shipment) {
        updatedShipment = await Shipment.findByIdAndUpdate(
          existingInvoice.shipment,
          shipmentData,
          { new: true }
        );
      } else {
        updatedShipment = await new Shipment(shipmentData).save();
      }
    }

    // Calculate profit: Total Income - To Hassan
    const totalIncome = Number(invoiceData.totalIncome) || 0;
    const toHassan = Number(invoiceData.toHassan) || 0;
    const totalProfit = totalIncome - toHassan;

    // Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        ...invoiceData,
        shipment: updatedShipment ? updatedShipment._id : existingInvoice.shipment,
        expenses: updatedExpense ? updatedExpense._id : existingInvoice.expenses,
        totalPayments,
        totalProfit
      },
      { new: true }
    ).populate('shipment').populate('expenses');

    // Update containers
    let updatedContainers = [];
    if (containerData && updatedShipment) {
      // Remove old containers for this shipment
      await Container.deleteMany({ shipment: updatedShipment._id });
      // Create new ones
      if (Array.isArray(containerData)) {
        for (const c of containerData) {
          const sc = await new Container({ ...c, shipment: updatedShipment._id, bayan: invoiceData.bayan || '' }).save();
          updatedContainers.push(sc);
        }
      } else {
        const sc = await new Container({ ...containerData, shipment: updatedShipment._id, bayan: invoiceData.bayan || '' }).save();
        updatedContainers.push(sc);
      }
    }

    res.json({
      invoice: updatedInvoice,
      shipment: updatedShipment,
      containers: updatedContainers,
      expense: updatedExpense
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists. Please use a unique number.' });
    }
    next(error);
  }
};

// @desc    Delete invoice and all related data
// @route   DELETE /api/invoices/:id
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Delete related shipment and its containers
    if (invoice.shipment) {
      await Container.deleteMany({ shipment: invoice.shipment });
      await Shipment.findByIdAndDelete(invoice.shipment);
    }

    // Delete related expense
    if (invoice.expenses) {
      await Expense.findByIdAndDelete(invoice.expenses);
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: 'Invoice and related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique importer names
// @route   GET /api/invoices/importers
const getImporterNames = async (req, res, next) => {
  try {
    const importers = await Invoice.distinct('importerName');
    res.json(importers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique Bayan numbers from across the system
// @route   GET /api/invoices/bayans
const getBayanNumbers = async (req, res, next) => {
  try {
    const invoiceBayans = await Invoice.distinct('bayan');
    const containerBayans = await Container.distinct('bayan');
    const expenseBayans = await Expense.distinct('bayan');
    
    // Combine and get unique non-empty strings
    const allBayans = [...invoiceBayans, ...containerBayans, ...expenseBayans];
    const uniqueBayans = [...new Set(allBayans)].filter(b => b && b.trim() !== '');
    
    res.json(uniqueBayans);
  } catch (error) {
    next(error);
  }
};

// @desc    Get next invoice number (for frontend auto-fill)
// @route   GET /api/invoices/next-number
const getNextInvoiceNumber = async (req, res, next) => {
  try {
    const nextNumber = await generateInvoiceNumber();
    const nextSerialNumber = await generateSerialNumber();
    res.json({ invoiceNumber: nextNumber, serialNumber: nextSerialNumber });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber,
  getImporterNames,
  getBayanNumbers
};
