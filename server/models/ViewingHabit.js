const mongoose = require('mongoose');

const viewingHabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  watchProgress: {
    type: Number, // in seconds
    default: 0
  },
  liked: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

viewingHabitSchema.index({ user: 1, content: 1 }, { unique: true });

module.exports = mongoose.model('ViewingHabit', viewingHabitSchema);
