const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const Profile = require('../models/Profile');

/**
 * GET /player/:contentId/:profileId
 * טוען את עמוד הנגן לתוכן שנבחר ומעביר אליו את כל הנתונים הדרושים
 */
router.get('/:contentId/:profileId', async (req, res) => {
  try {
    const { contentId, profileId } = req.params;

    // שליפת פרטי התוכן
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).send('Content not found');
    }

    // שליפת הפרופיל (כדי לבדוק אהבתי והתקדמות צפייה)
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).send('Profile not found');
    }

    // שליפת הזמן האחרון שנצפה (אם קיים)
    const lastPosition = profile.watchProgress.get(contentId) || 0;

    // בדיקה אם המשתמש סימן "אהבתי"
    const likedContent = profile.likedContent || [];
    const isLiked = likedContent.includes(contentId);

    // מציאת תכנים דומים לפי ז׳אנר
    const similarContent = await Content.find({
      genre: { $in: content.genre },
      _id: { $ne: content._id },
    }).limit(5);

    // במקרה של סדרה – שליפת כל הפרקים
    let episodes = [];
    if (content.type === 'series') {
      episodes = await Content.find({ seriesId: content._id }).sort({ episodeNumber: 1 });
    }

    // רינדור העמוד player.ejs
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
});

/**
 * POST /player/reset/:contentId/:profileId
 * איפוס צפייה (לצפייה מההתחלה)
 */
router.post('/reset/:contentId/:profileId', async (req, res) => {
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
});

module.exports = router;
