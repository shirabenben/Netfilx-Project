const mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  content: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['watchlist', 'favorites', 'custom'],
    default: 'custom'
  }
}, {
  timestamps: true
});

// Ensure unique catalog names per profile
catalogSchema.index({ profile: 1, name: 1 }, { unique: true });

// Prevent duplicate content in the same catalog
catalogSchema.pre('save', function(next) {
  if (this.content) {
        this.content = [...new Set(this.content.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
  }
  next();
});

module.exports = mongoose.model('Catalog', catalogSchema);
