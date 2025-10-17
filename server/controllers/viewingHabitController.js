const ViewingHabit = require('../models/ViewingHabit');
const Profile = require('../models/Profile');

// Get all viewing habits for a profile
exports.getAllViewingHabits = async (req, res) => {
  try {
    const profileId = req.query.profileId || req.profile?._id;
    if (!profileId) {
      return res.status(400).json({ message: 'Profile ID required' });
    }
    
    const viewingHabits = await ViewingHabit.find({ profile: profileId }).populate('content');
    res.json(viewingHabits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific viewing habit
exports.getViewingHabit = async (req, res) => {
  try {
    const profileId = req.query.profileId || req.profile?._id;
    if (!profileId) {
      return res.status(400).json({ message: 'Profile ID required' });
    }
    
    const viewingHabit = await ViewingHabit.findOne({ profile: profileId, content: req.params.contentId });
    if (!viewingHabit) {
      return res.status(404).json({ message: 'Viewing habit not found' });
    }
    res.json(viewingHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update a viewing habit and add to profile's watchedContent
exports.createOrUpdateViewingHabit = async (req, res) => {
  const { contentId, watchProgress, liked, profileId, duration } = req.body;

  try {
    const profile_Id = profileId || req.profile?._id;
    if (!profile_Id) {
      return res.status(400).json({ message: 'Profile ID required' });
    }

    // Update or create viewing habit
    let viewingHabit = await ViewingHabit.findOne({ profile: profile_Id, content: contentId });
    let isNewViewing = false;

    if (viewingHabit) {
      // Update existing habit
      viewingHabit.watchProgress = watchProgress !== undefined ? watchProgress : viewingHabit.watchProgress;
      viewingHabit.liked = liked !== undefined ? liked : viewingHabit.liked;
      viewingHabit.lastWatched = Date.now();
    } else {
      // Create new habit
      isNewViewing = true;
      viewingHabit = new ViewingHabit({
        profile: profile_Id,
        content: contentId,
        watchProgress: watchProgress || 0,
        liked: liked || false
      });
    }

    await viewingHabit.save();

    // Add to profile's watchedContent array for statistics ONLY if it's a new viewing
    if (isNewViewing) {
      const profile = await Profile.findById(profile_Id);
      if (profile) {
        // Check if content already exists in watchedContent to avoid duplicates
        const alreadyWatched = profile.watchedContent.some(
          item => item.contentId.toString() === contentId.toString()
        );
        
        if (!alreadyWatched) {
          profile.watchedContent.push({
            contentId: contentId,
            watchedAt: new Date(),
            duration: duration || 0
          });
          await profile.save();
        }
      }
    }

    res.status(201).json(viewingHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a viewing habit
exports.deleteViewingHabit = async (req, res) => {
  try {
    const profileId = req.query.profileId || req.profile?._id;
    if (!profileId) {
      return res.status(400).json({ message: 'Profile ID required' });
    }
    
    const viewingHabit = await ViewingHabit.findOneAndDelete({ profile: profileId, content: req.params.contentId });

    if (!viewingHabit) {
      return res.status(404).json({ message: 'Viewing habit not found' });
    }

    res.json({ message: 'Viewing habit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

