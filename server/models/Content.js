const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  genre: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one genre is required'
    }
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  rating: {
    type: String,
    required: true,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'],
    default: 'TV-14'
  },
  type: {
    type: String,
    required: true,
    enum: ['movie', 'series', 'episode'],
    default: 'movie',
  },
  episodeNumber: {
    type: Number,
    min: 1
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  totalEpisodes: { // אופציונלי, מספר פרקים בסדרה
    type: Number,
    min: 1
  },
  director: {
    type: String,
    trim: true,
    maxlength: 100
  },
  cast: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  actors: [{ // אופציונלי, עם אפשרות קישור לוויקיפדיה
    name: { type: String, trim: true, maxlength: 100 },
    wikiUrl: { type: String, trim: true }
  }],
  videoUrl: {
    type: String,
    trim: true
  },
  trailerUrl: { // אופציונלי, טריילר של התוכן
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  similarContentIds: [{ // אופציונלי, תוכן דומה
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }]
  starRating: {
    type: Number,
    default: 3,
    min: 1,
    max: 5
  },
  popularity: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Index for better search performance
contentSchema.index({ title: 'text', description: 'text' });
contentSchema.index({ genre: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ year: -1 });

// Add pagination plugin
contentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Content', contentSchema);
