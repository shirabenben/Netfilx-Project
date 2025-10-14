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
  getUserStatistics
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
