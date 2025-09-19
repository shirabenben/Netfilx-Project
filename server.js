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

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/netflix')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const movieRoutes = require('./server/routes/movies');
const userRoutes = require('./server/routes/users');
const contentRoutes = require('./server/routes/content');
const catalogRoutes = require('./server/routes/catalogs');

app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/catalogs', catalogRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
