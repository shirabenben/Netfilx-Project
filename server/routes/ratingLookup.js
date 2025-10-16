const express = require('express');
const router = express.Router();
const omdbService = require('../services/omdbService');

// GET /api/rating-lookup - Get Rotten Tomatoes rating suggestion
router.get('/', async (req, res) => {
  try {
    const { title, year } = req.query;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title parameter is required'
      });
    }

    const result = await omdbService.getNetflixRatingSuggestion(title.trim(), year);

    if (result.success) {
      res.json({
        success: true,
        title: result.title,
        year: result.year,
        rtRating: result.rtRating,
        suggestedRating: result.suggestedRating,
        message: `Found content with ${result.rtRating}% Rotten Tomatoes rating. Suggested Netflix rating: ${result.suggestedRating}`,
        additionalInfo: result.fullInfo
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
        suggestedRating: result.suggestion, // Default fallback
        message: 'Could not retrieve Rotten Tomatoes rating. Using default suggestion.'
      });
    }
  } catch (error) {
    console.error('Rating lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while looking up rating',
      suggestedRating: 'TV-14' // Default fallback
    });
  }
});

module.exports = router;
