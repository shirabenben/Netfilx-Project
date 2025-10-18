const Content = require('../models/Content');
const Profile = require('../models/Profile');

module.exports = {
  // ---------- GET /player/:contentId/:profileId ----------
  getPlayerPage: async (req, res) => {
    try {
      const { contentId, profileId } = req.params;

      // Retrieve content details
      const content = await Content.findById(contentId);
      if (!content) return res.status(404).send('Content not found');

      // Retrieve profile (to check likes and watch progress)
      const profile = await Profile.findById(profileId);
      if (!profile) return res.status(404).send('Profile not found');

      // Retrieve last watched position
      const lastPosition = profile.watchProgress.get(contentId) || 0;

      // Check if user liked the content
      const isLiked = (profile.likedContent || []).includes(contentId);

      // Find similar content by genre
      const similarContent = await Content.find({
        genre: { $in: content.genre },
        _id: { $ne: content._id },
      }).limit(5);

      // In case of a series – retrieve all episodes
      let episodes = [];
      if (content.type === 'series') {
        episodes = await Content.find({ seriesId: content._id }).sort({ episodeNumber: 1 });
      }

      // Render the player.ejs page
      res.render('player', {
        content,
        profile,
        lastPosition,
        isLiked,
        similarContent,
        episodes
      });

    } catch (error) {
      console.error('Error loading player page:', error);
      res.status(500).send('Internal server error');
    }
  },

  // ---------- POST /player/reset/:contentId/:profileId ----------
  resetProgress: async (req, res) => {
    try {
      const { contentId, profileId } = req.params;
      const profile = await Profile.findById(profileId);

      if (!profile) return res.status(404).json({ message: 'Profile not found' });

      profile.watchProgress.set(contentId, 0);
      await profile.save();

      res.status(200).json({ message: 'Watch progress reset successfully.' });
    } catch (error) {
      console.error('Error resetting watch progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
