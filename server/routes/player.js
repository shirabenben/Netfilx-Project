const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const Profile = require('../models/Profile');

// Route to player by episode ID
router.get('/:id', async (req, res) => {
  try {
    // Fetch all episodes sorted by year or episodeNumber
    const episodes = await Content.find({ type: 'episode' }).sort({ year: 1 });

    // Find the requested episode by ID
    const episode = episodes.find(ep => ep._id.equals(req.params.id));
    if (!episode) return res.status(404).send('Episode not found');

    // Fetch profile from session if exists
    let profile = null;
    if (req.session && req.session.profileId) {
      profile = await Profile.findById(req.session.profileId);
    }

    // Fallback: create a temporary guest profile if none exists
    if (!profile) {
      profile = {
        _id: null,
        name: 'Guest'
      };
    }

    // Render player.ejs עם כל המידע הנדרש
    res.render('player', {
      episode,
      episodes,
      profile
    });
  } catch (err) {
    console.error('Error loading player:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
