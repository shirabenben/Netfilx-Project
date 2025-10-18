const mongoose = require('mongoose');
const viewingHistorySchema = require('./ViewingHistory');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Stores the last watch position for each content item
  watchProgress: {
    type: Map,
    of: Number, // stores the last watched time in seconds
    default: {}
  },

  // Content IDs that the user liked (for like/unlike)
  likedContent: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Content',
    default: []
  },

  // Optional: series IDs that the user completed
  completedSeries: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Content',
        default: []
  },
watchedContent: [
  {
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    watchedAt: [{ type: Date, default: Date.now }]
  }
]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for viewing habits
profileSchema.virtual('viewingHabits', {
  ref: 'ViewingHabit',
  localField: '_id',
  foreignField: 'profile'
});

// Virtual populate for catalogs
profileSchema.virtual('catalogs', {
  ref: 'Catalog',
  localField: '_id',
  foreignField: 'profile'
});

// Ensure unique profile names per user
profileSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);
