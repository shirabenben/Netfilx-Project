const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { trackWatch } = require('../controllers/watchProgressController');


/**
 * Route to update watch progress for a specific content and profile
 */
router.post('/', async (req, res) => {
  try {
    const { profileId, contentId, position } = req.body;

    if (!profileId || !contentId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });

    profile.watchProgress.set(contentId, position);
    await profile.save();

    res.status(200).json({ message: 'Watch progress updated successfully.' });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * Route to get watch progress and like status for a specific content and profile
 */
router.get('/:profileId/:contentId', async (req, res) => {
  try {
    const { profileId, contentId } = req.params;

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });

    const position = profile.watchProgress.get(contentId) || 0;
    const liked = profile.likedContent?.some(id => id.toString() === contentId) || false;

    res.status(200).json({ position, liked });
  } catch (error) {
    console.error('Error fetching watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * Route to reset watch progress for a specific content and profile
 */
router.post('/reset', async (req, res) => {
  try {
    const { profileId, contentId } = req.body;

    if (!profileId || !contentId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });

    profile.watchProgress.delete(contentId);
    await profile.save();

    res.status(200).json({ message: 'Watch progress reset successfully.' });
  } catch (error) {
    console.error('Error resetting watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * Route to toggle like/unlike for a specific content and profile
 */
router.post('/like', async (req, res) => {
  try {
    const { profileId, contentId } = req.body;

    if (!profileId || !contentId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });

    if (!profile.likedContent) profile.likedContent = [];

    const index = profile.likedContent.findIndex(id => id.toString() === contentId);
    let liked;

    if (index > -1) {
      // Unlike
      profile.likedContent.splice(index, 1);
      liked = false;
    } else {
      // Like
      profile.likedContent.push(contentId);
      liked = true;
    }

    await profile.save();

    res.status(200).json({ liked });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * Route to update watch progress (PUT) - used for "watch from beginning"
 */
router.put('/:profileId/:contentId', async (req, res) => {
  try {
    const { profileId, contentId } = req.params;
    const { position } = req.body;

    if (!profileId || !contentId || position === undefined) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });

    profile.watchProgress.set(contentId, position);
    await profile.save();

    res.status(200).json({ message: 'Watch progress updated successfully.' });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * Route to reset watch progress for a series
 */
router.post('/reset-series', async (req, res) => {
  try {
    const { profileId, episodeIds } = req.body;

    if (!profileId || !episodeIds || !Array.isArray(episodeIds)) {
      return res.status(400).json({ message: 'Missing required fields or invalid episodeIds.' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });

    episodeIds.forEach(epId => profile.watchProgress.set(epId, 0));

    await profile.save();

    res.status(200).json({ message: 'Series watch progress reset successfully.' });
  } catch (error) {
    console.error('Error resetting series watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.post('/track-watch', trackWatch);

module.exports = router;
