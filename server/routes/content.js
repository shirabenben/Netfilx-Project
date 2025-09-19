const express = require('express');
const router = express.Router();
const {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByGenre,
  getTrendingContent
} = require('../controllers/contentController');

// GET /api/content - Get all content with optional filtering
router.get('/', getAllContent);

// GET /api/content/trending - Get trending content
router.get('/trending', getTrendingContent);

// GET /api/content/genre/:genre - Get content by genre
router.get('/genre/:genre', getContentByGenre);

// GET /api/content/:id - Get content by ID
router.get('/:id', getContentById);

// POST /api/content - Create new content
router.post('/', createContent);

// PUT /api/content/:id - Update content
router.put('/:id', updateContent);

// DELETE /api/content/:id - Delete content (soft delete)
router.delete('/:id', deleteContent);

module.exports = router;
