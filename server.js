require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./server/routes/users');
const contentRoutes = require('./server/routes/content');
const catalogRoutes = require('./server/routes/catalogs');
const viewingHabitRoutes = require('./server/routes/viewingHabits');

app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/viewing-habits', viewingHabitRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  console.log('Homepage route called');
  console.log('Views directory:', app.get('views'));
  res.render('homepage', { title: 'Netflix Project' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
