require('dotenv').config();
const mongoose = require('mongoose');
const mongooseStayConnected = require('mongoose');

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const bcrypt = require('bcrypt');

    // First, delete any existing admin user
    const deleteResult = await mongoose.connection.db.collection('users').deleteMany({ username: 'admin' });
    console.log(`Deleted ${deleteResult.deletedCount} existing admin user(s)`);

    // Hash password directly
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Insert new admin user directly to bypass mongoose validations
    const result = await mongoose.connection.db.collection('users').insertOne({
      username: 'admin',
      email: 'admin@netflix.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      profiles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin (plaintext for login)');
    console.log('Email: admin@netflix.com');
    console.log('Is Admin: true');
    console.log('MongoDB ObjectId:', result.insertedId);

    // Verify the user was created
    const verify = await mongoose.connection.db.collection('users').findOne({ username: 'admin' });
    if (verify) {
      console.log('Verification: Admin user confirmed in database');
      console.log('Stored password hash:', verify.password.substring(0, 20) + '...');
    }

  } catch (err) {
    console.error('Error creating admin user:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
