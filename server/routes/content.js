const express = require('express');
const router = express.Router();
const {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByGenre,
  getTrendingContent,
  getMostPopularContent,
  getNewestMovies,
  getNewestSeries,
  getCountinueWatchContent,
  markContentAsWatched,
  searchContent
} = require('../controllers/contentController');

const { requireAuth, requireProfile } = require('../middleware/auth');
const Profile = require('../models/Profile');
const Content = require('../models/Content');

// ---------------- Existing API routes ----------------

// GET /api/content - Get all content with optional filtering
router.get('/', requireAuth, requireProfile, getAllContent);

// GET /api/content/popular - popular content
router.get('/popular', getMostPopularContent);

// GET /api/content/continue-watching - Continue watching content
router.get('/continue-watching', getCountinueWatchContent);

// GET /api/content/newest-movies - newest movies content
router.get('/newest-movies', getNewestMovies);

// GET /api/content/newest-series - newest series content
router.get('/newest-series', getNewestSeries);

// GET /api/content/genre/:genre - Content by genre
router.get('/genre/:genre', getContentByGenre);

// GET /content/search - Search content page (public access)
router.get('/search', searchContent);

// POST /api/content - Create new content
router.post('/', createContent);

// PUT /api/content/:id - Update content
router.put('/:id', updateContent);

// DELETE /api/content/:id - Delete content (soft delete)
router.delete('/:id', deleteContent);

// ---------------- Content Page route (/content/view/:id) ----------------
router.get('/view/:id', getContentById);

// PUT /api/content/mark-watched - Mark content as watched or unwatched for a profile
router.put('/mark-watched', markContentAsWatched);

module.exports = router;
