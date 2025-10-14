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
  markContentAsWatched
} = require('../controllers/contentController');

const { requireAuth, requireProfile } = require('../middleware/auth');

// GET /api/content - Get all content with optional filtering
router.get('/', requireAuth, requireProfile, getAllContent);

// GET /api/content/popular - Get most popular content
router.get('/popular', getMostPopularContent);

// GET /api/content/newest-movies - Get newest movies
router.get('/newest-movies', getNewestMovies);

// GET /api/content/newest-series - Get newest series
router.get('/newest-series', getNewestSeries);

// GET /api/content/trending - Get trending content
router.get('/trending', getTrendingContent);

// GET /api/content/genre/:genre - Get content by genre
router.get('/genre/:genre', getContentByGenre);

// GET /api/content/:id - Get content by ID
router.get('/:id', getContentById);

// PUT /api/content/mark-watched - Mark content as watched or unwatched for a profile
router.put('/mark-watched', markContentAsWatched);

// POST /api/content - Create new content
router.post('/', createContent);

// PUT /api/content/:id - Update content
router.put('/:id', updateContent);

// DELETE /api/content/:id - Delete content (soft delete)
router.delete('/:id', deleteContent);

module.exports = router;
