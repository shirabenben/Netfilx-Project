const mongoose = require('mongoose');

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
  }
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