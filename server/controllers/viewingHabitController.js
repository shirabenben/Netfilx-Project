const ViewingHabit = require('../models/ViewingHabit');

// Get all viewing habits for a user
exports.getAllViewingHabits = async (req, res) => {
  try {
    const viewingHabits = await ViewingHabit.find({ user: req.user.id }).populate('content');
    res.json(viewingHabits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific viewing habit
exports.getViewingHabit = async (req, res) => {
  try {
    const viewingHabit = await ViewingHabit.findOne({ user: req.user.id, content: req.params.contentId });
    if (!viewingHabit) {
      return res.status(404).json({ message: 'Viewing habit not found' });
    }
    res.json(viewingHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update a viewing habit
exports.createOrUpdateViewingHabit = async (req, res) => {
  const { contentId, watchProgress, liked } = req.body;

  try {
    let viewingHabit = await ViewingHabit.findOne({ user: req.user.id, content: contentId });

    if (viewingHabit) {
      // Update existing habit
      viewingHabit.watchProgress = watchProgress || viewingHabit.watchProgress;
      viewingHabit.liked = liked !== undefined ? liked : viewingHabit.liked;
      viewingHabit.lastWatched = Date.now();
    } else {
      // Create new habit
      viewingHabit = new ViewingHabit({
        user: req.user.id,
        content: contentId,
        watchProgress,
        liked
      });
    }

    const updatedHabit = await viewingHabit.save();
    res.status(201).json(updatedHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a viewing habit
exports.deleteViewingHabit = async (req, res) => {
  try {
    const viewingHabit = await ViewingHabit.findOneAndDelete({ user: req.user.id, content: req.params.contentId });

    if (!viewingHabit) {
      return res.status(404).json({ message: 'Viewing habit not found' });
    }

    res.json({ message: 'Viewing habit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
