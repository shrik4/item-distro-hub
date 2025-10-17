// seed/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedAdmin() {
  try {
    // Connect to DB
    await connectDB(process.env.MONGO_URI);
    
    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${adminEmail}`);
      process.exit(0);
    }
    
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });
    
    await admin.save();
    console.log(`Admin user created with email: ${adminEmail}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();