const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  getUserProfiles,
  createProfile,
  updateUser,
  deleteUser,
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

// POST /api/users/profiles - Create new profile (protected)
router.post('/profiles', requireAuth, createProfile);

// GET /api/users/profiles/:profileId/watched - Get watched content for a profile (protected)
router.get('/profiles/:profileId/watched', requireAuth, getWatchedContent);

// GET /api/users/profiles/:profileId/unwatched - Get unwatched content for a profile (protected)
router.get('/profiles/:profileId/unwatched', requireAuth, getUnwatchedContent);

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
