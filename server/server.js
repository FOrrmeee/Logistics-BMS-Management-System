// Trigger nodemon restart
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const containerRoutes = require('./routes/containerRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Logistics BMS API is running');
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/logistics-bms')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log('MongoDB connection error:', err));
