const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['info', 'error', 'warn'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  meta: {
    type: Object
  }
});

logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1 });

module.exports = mongoose.model('Log', logSchema);
