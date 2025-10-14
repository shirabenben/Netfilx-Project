require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Import required middleware and controllers
const { requireAuth, requireProfile, requireAdmin } = require('./server/middleware/auth');
const { getUserProfiles } = require('./server/controllers/userController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'netflix-project-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: false, // set to true if using https
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

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

// Add content form route
app.get('/add-content', requireAuth, requireProfile, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add-content.html'));
});

// API route to create content (admin only)
app.post('/add-content', requireAuth, requireProfile, requireAdmin, (req, res) => {
  res.redirect('/homepage'); // Or handle content creation here - for now redirect to homepage
});

// Main homepage route
app.get('/homepage', requireAuth, requireProfile, (req, res) => {
  res.render('homepage', {
    title: 'Netflix Project',
    profile: req.profile,
    user: req.user
  });
});

// Clean URL redirects to users routes
app.get('/profiles', requireAuth, getUserProfiles);

app.get('/logout', (req, res) => {
  res.redirect('/api/users/logout-view');
});

// Basic route for testing
app.get('/', (req, res) => {
  // For unauthenticated users, redirect to login
  if (!req.session || !req.session.userId) {
    return res.redirect('/login.html');
  }
  // For authenticated users, redirect to profiles
  res.redirect('/profiles');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
