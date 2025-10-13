const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Route to player by episode ID
router.get('/:id', async (req, res) => {
  try {
    const episodes = await Content.find({ type: 'episode' }).sort({ year: 1 });
    const episode = episodes.find(ep => ep._id.equals(req.params.id));

    if (!episode) return res.status(404).send('Episode not found');

    res.render('player', { episode, episodes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
