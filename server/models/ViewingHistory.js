const mongoose = require('mongoose');

// Viewing History Schema - Used as subdocument in Profile
const viewingHistorySchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  watchedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  duration: {
    type: Number, // in seconds - how long they watched in this session
    default: 0
  }
}, {
  timestamps: true
});

// Export schema for use in Profile model
module.exports = viewingHistorySchema;

