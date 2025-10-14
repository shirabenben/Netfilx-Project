require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Import required middleware and controllers
const { requireAuth, requireProfile } = require('./server/middleware/auth');
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
const playerRoutes = require('./server/routes/player');
const Content = require('./server/models/Content');
const watchProgressRoutes = require('./server/routes/watchProgress');



app.use('/player', playerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/viewing-habits', viewingHabitRoutes);
app.use('/watch-progress', watchProgressRoutes);


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

// Route for video player page
app.get('/player', (req, res) => {
  res.render('player'); // מטעין את views/player.ejs
});


// Player route
app.get('/player/:id', async (req, res) => {
  try {
    const episode = await Content.findById(req.params.id);
    if (!episode) return res.status(404).send('Episode not found');

    let episodes = [];
    if (episode.seriesId) {
      episodes = await Content.find({ seriesId: episode.seriesId }).sort({ episodeNumber: 1 });
    }

    res.render('player', { episode, episodes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
