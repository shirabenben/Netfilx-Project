require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Import required middleware and controllers
const { requireAuth, requireProfile, requireAdmin } = require('./server/middleware/auth');
const { getUserProfiles } = require('./server/controllers/userController');
const Profile = require('./server/models/Profile');
const Content = require('./server/models/Content');

// Import routes
const userRoutes = require('./server/routes/users');
const contentRoutes = require('./server/routes/content');
const catalogRoutes = require('./server/routes/catalogs');
const viewingHabitRoutes = require('./server/routes/viewingHabits');
const playerRoutes = require('./server/routes/player');
const watchProgressRoutes = require('./server/routes/watchProgress');
const profileRoutes = require('./server/routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------- Middleware ----------------------
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
    secure: false, // set true if using https
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS template engine
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
const ratingLookupRoutes = require('./server/routes/ratingLookup');

// ---------------------- Routes ----------------------
// API routes
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/content', contentRoutes); // pages
app.use('/api/catalogs', catalogRoutes);
app.use('/api/viewing-habits', viewingHabitRoutes);
app.use('/api/profile', profileRoutes); // Likes, etc.
app.use('/watch-progress', watchProgressRoutes);
app.use('/api/rating-lookup', ratingLookupRoutes);

// Add content form route
app.get('/add-content', requireAuth, requireProfile, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add-content.html'));
});

// API route to create content (admin only)
app.post('/add-content', requireAuth, requireProfile, requireAdmin, (req, res) => {
  res.redirect('/homepage'); // Or handle content creation here - for now redirect to homepage
});

// Player routes
app.use('/player', playerRoutes);

// ---------------------- Main Pages ----------------------

// Homepage route
app.get('/homepage', requireAuth, requireProfile, (req, res) => {
  res.render('homepage', {
    title: 'Netflix Project',
    profile: req.profile,
    user: req.user
  });
});

// Profiles listing
app.get('/profiles', requireAuth, getUserProfiles);

// Logout redirect
app.get('/logout', (req, res) => {
  res.redirect('/api/users/logout-view');
});

// Root route
app.get('/', (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login.html');
  res.redirect('/profiles');
});

// ---------------------- Content Page ----------------------
// Full content screen with all features
app.get('/content/:id', requireAuth, requireProfile, async (req, res) => {
  try {
    const contentId = req.params.id;
    const profile = req.profile;

    const content = await Content.findById(contentId);
    if (!content) return res.status(404).send('Content not found');

    // Episodes if series
    let episodes = [];
    if (content.type === 'series') {
      episodes = await Content.find({ seriesId: content._id }).sort({ episodeNumber: 1 });
    }

    // Similar content (max 5)
    const similarContents = await Content.find({
      _id: { $ne: content._id },
      genre: { $in: content.genre }
    }).limit(5);

    // Watch progress
    const watchProgress = profile.watchProgress.get(content._id.toString()) || 0;

    // Last watched episode
    let lastWatchedEpisode = null;
    if (content.type === 'series' && episodes.length > 0) {
      for (const ep of episodes) {
        const pos = profile.watchProgress.get(ep._id.toString());
        if (pos) lastWatchedEpisode = ep._id;
      }
    }

    // Check if series finished
    const seriesFinished = content.type === 'series' && episodes.every(ep => profile.watchProgress.get(ep._id.toString()) >= (ep.duration || 0));

    // Liked status placeholder
    const liked = false; // אם יש מאגר לייקים אפשר לשנות בהתאם

    res.render('content', {
      content,
      profileId: profile._id,
      watchProgress,
      lastWatchedEpisode,
      seriesFinished,
      episodes,
      similarContents,
      liked
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ---------------------- Player Page ----------------------
app.get('/player/:id', async (req, res) => {
  try {
    // ⚡ Fetch profile from session if exists to avoid ReferenceError
    const profile = req.profile || (req.session?.profileId ? await Profile.findById(req.session.profileId) : null);

    const episode = await Content.findById(req.params.id);
    if (!episode) return res.status(404).send('Episode not found');

    let episodes = [];
    if (episode.seriesId) {
      episodes = await Content.find({ seriesId: episode.seriesId }).sort({ episodeNumber: 1 });
    }

    // ⚡ Get last watch progress for this episode
    const progress = profile ? profile.watchProgress.get(episode._id.toString()) || 0 : 0;

    res.render('player', { episode, episodes, profile, progress }); // ⚡ Pass progress to EJS
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ---------------------- Start Server ----------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
