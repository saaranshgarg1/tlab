const mongoose = require('mongoose');

/**
 * GarbageBin Schema
 * Represents a single garbage bin with its fill level and status
 */
const GarbageBinSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    default: 'Default Location',
  },
  fillLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Empty', 'Filling', 'Full', 'Error'],
    default: 'Empty',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Method to determine status based on fill level
 * @param {Number} level - Fill level percentage (0-100)
 * @returns {String} Status string
 */
GarbageBinSchema.statics.determineStatus = function(level) {
  if (level >= 0 && level <= 60) {
    return 'Empty';
  } else if (level >= 61 && level <= 80) {
    return 'Filling';
  } else if (level >= 81 && level <= 100) {
    return 'Full';
  } else {
    return 'Error';
  }
};

module.exports = mongoose.model('GarbageBin', GarbageBinSchema);
