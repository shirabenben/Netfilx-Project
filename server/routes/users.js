const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  getUserProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  updateUser,
  deleteUser,
  getUserStatistics,
  migrateViewingHistory,
  getWatchedContent,
  getUnwatchedContent
} = require('../controllers/userController');

const { requireAuth, requireProfile, login, logout } = require('../middleware/auth');

// GET /api/users - Get all users
router.get('/', getAllUsers);

// POST /api/users/register - Register new user with profile
router.post('/register', createUser);

// POST /api/users/login - Login user
router.post('/login', login);

// GET /api/users/logout - Logout user
router.get('/logout', logout);

// GET /api/users/profiles - Get user profiles as JSON (protected)
router.get('/profiles', requireAuth, getUserProfiles);

// GET /api/users/profiles/:profileId/watched - Get watched content for a profile (protected)
router.get('/profiles/:profileId/watched', requireAuth, getWatchedContent);

// GET /api/users/profiles/:profileId/unwatched - Get unwatched content for a profile (protected)
router.get('/profiles/:profileId/unwatched', requireAuth, getUnwatchedContent);

// GET /api/users/settings - Settings page for managing profiles (protected)
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate('profiles');
    
    if (!user) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'User not found'
      });
    }

    res.render('settings', {
      title: 'Manage Profiles',
      profiles: user.profiles,
      user: user,
      profile: req.profile || null
    });
  } catch (error) {
    console.error('Error loading settings:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading settings page'
    });
  }
});

// GET /api/users/statistics - Statistics page (protected)
router.get('/statistics-page', requireAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate('profiles');
    
    if (!user) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'User not found'
      });
    }

    res.render('statistics', {
      title: 'Statistics',
      profiles: user.profiles,
      user: user
    });
  } catch (error) {
    console.error('Error loading statistics page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading statistics page'
    });
  }
});

// GET /api/users/statistics - Get user statistics data (protected)
router.get('/statistics', requireAuth, getUserStatistics);

// POST /api/users/migrate-viewing-history - Migrate existing viewing habits to watchedContent (protected)
router.post('/migrate-viewing-history', requireAuth, migrateViewingHistory);

// GET /api/users/check-migration - Check if migration is needed (protected)
router.get('/check-migration', requireAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const ViewingHabit = require('../models/ViewingHabit');
    const Profile = require('../models/Profile');
    
    const user = await User.findById(req.user._id).populate('profiles');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let totalViewingHabits = 0;
    let totalWatchedContent = 0;
    const profileDetails = [];
    
    for (const profile of user.profiles) {
      const habits = await ViewingHabit.find({ profile: profile._id });
      
      // Get the actual profile with watched content
      const fullProfile = await Profile.findById(profile._id);
      const watchedCount = fullProfile?.watchedContent?.length || 0;
      
      totalViewingHabits += habits.length;
      totalWatchedContent += watchedCount;
      
      profileDetails.push({
        name: profile.name,
        viewingHabits: habits.length,
        watchedContent: watchedCount,
        sampleDates: fullProfile?.watchedContent?.slice(0, 3).map(w => w.watchedAt) || []
      });
    }
    
    res.json({
      success: true,
      needsMigration: totalViewingHabits > totalWatchedContent,
      data: {
        profiles: user.profiles.length,
        viewingHabits: totalViewingHabits,
        watchedContent: totalWatchedContent,
        profileDetails: profileDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/profiles - Create new profile (protected)
router.post('/profiles', requireAuth, createProfile);

// PUT /api/users/profiles/:id - Update profile (protected)
router.put('/profiles/:id', requireAuth, updateProfile);

// DELETE /api/users/profiles/:id - Delete profile (protected)
router.delete('/profiles/:id', requireAuth, deleteProfile);

// GET /logout - Logout user  
router.get('/logout-view', (req, res) => {
  res.redirect('/api/users/logout');
});

// GET /api/users/:id - Get user by ID (must come after specific routes)
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
