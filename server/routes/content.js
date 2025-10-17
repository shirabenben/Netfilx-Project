const express = require('express');
const router = express.Router();
const {
  getAllContent,
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
const Profile = require('../models/Profile');
const Content = require('../models/Content');

// ---------------- Existing API routes ----------------

// GET /api/content - Get all content with optional filtering
router.get('/', requireAuth, requireProfile, getAllContent);

// GET /api/content/popular - popular content
router.get('/popular', getMostPopularContent);

// GET /api/content/popular - newsest movies content
router.get('/newest-movies', getNewestMovies);

// GET /api/content/popular - newsest series content
router.get('/newest-series', getNewestSeries);

// GET /api/content/genre/:genre - Content by genre
router.get('/genre/:genre', getContentByGenre);

// POST /api/content - Create new content
router.post('/', createContent);

// PUT /api/content/:id - Update content
router.put('/:id', updateContent);

// DELETE /api/content/:id - Delete content (soft delete)
router.delete('/:id', deleteContent);

// ---------------- Player route (/player/:id) ----------------
router.get('/player/:id', async (req, res) => {
  try {
    const contentId = req.params.id;
    const profile = req.session?.profileId
      ? await Profile.findById(req.session.profileId).lean()
      : null;

    if (profile?.watchProgress && !(profile.watchProgress instanceof Map)) {
      profile.watchProgress = new Map(Object.entries(profile.watchProgress.toObject?.() || profile.watchProgress));
    }

    const content = await Content.findById(contentId).lean();
    if (!content) return res.status(404).send('Content not found');

    const starRatingDisplay =
      content.starRating != null ? `${content.starRating} ⭐` : 'N/A ⭐';

    let episodes = [];
    if (content.type === 'series') {
      episodes = await Content.find({ seriesId: content._id })
        .sort({ episodeNumber: 1 })
        .lean();
    }

    let lastWatchedEpisode = null;
    if (profile && content.type === 'series' && episodes.length) {
      for (let ep of episodes.reverse()) {
        if (profile.watchProgress?.get(ep._id.toString()) > 0) {
          lastWatchedEpisode = ep._id.toString();
          break;
        }
      }
    }

    const similar = await Content.find({
      _id: { $ne: content._id },
      genre: { $in: content.genre },
      type: { $in: ['movie', 'series'] }
    }).limit(5).lean();

    res.render('player', {
      content,
      episode: content,
      episodes,
      profile,             
      profileId: profile?._id,
      similar,
      lastWatchedEpisode,
      starRatingDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ---------------- Content Page route (/content/view/:id) ----------------
router.get('/view/:id', async (req, res) => {
  try {
    const contentId = req.params.id;
    const profileId = req.session?.profileId || req.query.profileId;
    const profile = profileId ? await Profile.findById(profileId).lean() : null;

    // ⚡ המרת watchProgress ל־Map לפני כל שימוש
    if (profile?.watchProgress) {
      if (!(profile.watchProgress instanceof Map)) {
        profile.watchProgress = new Map(Object.entries(profile.watchProgress.toObject?.() || profile.watchProgress));
      }
    }

    const content = await Content.findById(contentId).lean();
    if (!content) return res.status(404).send('Content not found');

    if (!['movie', 'series'].includes(content.type)) {
      return res.status(400).send('Invalid content type');
    }

    const starRatingDisplay =
      content.starRating != null ? `${content.starRating} ⭐` : 'N/A ⭐';

    const liked = profile?.likedContents?.some(id => id.toString() === contentId) || false;
    const watchProgress = profile?.watchProgress?.get(contentId) || 0;

    let episodes = [];
    if (content.type === 'series') {
      episodes = await Content.find({ seriesId: content._id })
        .sort({ episodeNumber: 1 })
        .lean();
    }

    const seriesFinished =
      content.type === 'series' &&
      profile &&
      episodes.length > 0 &&
      profile.watchProgress?.get(episodes[episodes.length - 1]._id.toString()) >=
        (episodes[episodes.length - 1].duration || 0) - 5;

    let lastWatchedEpisode = null;
    if (profile && content.type === 'series' && episodes.length) {
      for (let ep of episodes.reverse()) {
        if (profile.watchProgress?.get(ep._id.toString()) > 0) {
          lastWatchedEpisode = ep._id.toString();
          break;
        }
      }
    }

    const similarContents = await Content.find({
      _id: { $ne: content._id },
      genre: { $in: content.genre },
      type: { $in: ['movie', 'series'] }
    }).limit(6).lean();

    res.render('content', {
      content,
      profile,           // ⚡ שולח את profile כדי שהטיימליין יעבוד
      profileId: profile?._id,
      liked,
      watchProgress,
      episodes,
      seriesFinished,
      lastWatchedEpisode,
      similarContents,
      starRatingDisplay,
    });
  } catch (err) {
    console.error('Error loading content page:', err);
    res.status(500).send('Server error');
  }
});
// PUT /api/content/mark-watched - Mark content as watched or unwatched for a profile
router.put('/mark-watched', markContentAsWatched);

module.exports = router;
