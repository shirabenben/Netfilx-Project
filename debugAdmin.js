const mongoose = require('mongoose');
const User = require('./server/models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function debugAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ username: 'admin' }).select('+password');
    if (adminUser) {
      console.log('Admin user found:');
      console.log('Username:', adminUser.username);
      console.log('Email:', adminUser.email);
      console.log('First Name:', adminUser.firstName);
      console.log('Last Name:', adminUser.lastName);
      console.log('Is Admin:', adminUser.isAdmin);
      console.log('Password exists:', !!adminUser.password);
      console.log('Password hash:', adminUser.password);

      // Test password comparison
      const passwordMatch = await bcrypt.compare('admin', adminUser.password);
      console.log('Password "admin" matches DB hash:', passwordMatch);

    } else {
      console.log('Admin user not found in database');
    }

  } catch (err) {
    console.error('Error debugging admin user:', err);
  } finally {
    mongoose.connection.close();
  }
}

debugAdmin();
