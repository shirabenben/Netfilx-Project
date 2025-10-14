const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');

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
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Save last watched time (in seconds)
    profile.watchProgress.set(contentId, position);
    await profile.save();

    res.status(200).json({ message: 'Watch progress updated successfully.' });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * Route to get watch progress for a specific content and profile
 */
router.get('/:profileId/:contentId', async (req, res) => {
  try {
    const { profileId, contentId } = req.params;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const position = profile.watchProgress.get(contentId) || 0;

    res.status(200).json({ position });
  } catch (error) {
    console.error('Error fetching watch progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
