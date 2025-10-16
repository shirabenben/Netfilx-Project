// server/controllers/profileController.js

const User = require('../models/User');
const Profile = require('../models/Profile');

module.exports = {

  // מחזיר את כל התכנים שהמשתמש סימן "אהבתי"
  getProfile: async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).send('Unauthorized');

      const user = await User.findById(userId).populate('likedContent');
      res.json(user.likedContent);
    } catch (err) {
      console.error('Error in getProfile:', err);
      res.status(500).send('Server error');
    }
  },

  // Toggle Like
  toggleLike: async (req, res) => {
    try {
      const userId = req.session.userId || req.body.profileId;
      const contentId = req.body.contentId || req.params.contentId;

      if (!userId || !contentId) 
        return res.status(400).json({ success: false, message: 'Missing userId or contentId' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const index = user.likedContent.indexOf(contentId);
      let liked = false;

      if (index === -1) {
        user.likedContent.push(contentId);
        liked = true;
      } else {
        user.likedContent.splice(index, 1);
        liked = false;
      }

      await user.save();
      res.json({ success: true, liked });

    } catch (err) {
      console.error('Error in toggleLike:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

};
