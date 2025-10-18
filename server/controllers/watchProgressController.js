const Profile = require('../models/Profile');

module.exports = {
  // Add new watch time
  trackWatch: async (req, res) => {
    try {
      const { profileId, contentId } = req.body;

      if (!profileId || !contentId) {
        return res.status(400).json({ message: 'Missing profileId or contentId.' });
      }

      const profile = await Profile.findById(profileId);
      if (!profile) return res.status(404).json({ message: 'Profile not found.' });

      // Check if the content already exists
      const existing = profile.watchedContent.find(
        item => item.contentId.toString() === contentId
      );

      if (existing) {
        if (!Array.isArray(existing.watchedAt)) existing.watchedAt = [];
        existing.watchedAt.push(new Date());
      } else {
        profile.watchedContent.push({
          contentId,
          watchedAt: [new Date()]
        });
      }

      await profile.save();
      res.status(200).json({ message: 'Watch history updated successfully.' });
    } catch (error) {
      console.error('Error updating watch history:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};
