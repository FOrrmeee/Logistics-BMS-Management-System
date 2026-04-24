// Seed script: creates a default admin user
// Run with: node seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/logistics-bms');
    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
    } else {
      await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
      console.log('Admin user created successfully (username: admin, password: admin123)');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
