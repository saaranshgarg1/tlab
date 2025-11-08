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
  // Coordinates for mapping
  lat: {
    type: Number,
    required: false,
  },
  lng: {
    type: Number,
    required: false,
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
    enum: ['Empty', 'Filling', 'Maintenance', 'Full', 'Error'],
    default: 'Empty',
  },
  // Threshold for triggering collection (default 60%)
  threshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 60,
  },
  // Maintenance flag
  maintenanceFlag: {
    type: Boolean,
    default: false,
  },
  // Label/Description
  label: {
    type: String,
    trim: true,
  },
  // Statistics
  stats: {
    totalCollections: {
      type: Number,
      default: 0,
    },
    averageFillRate: {
      type: Number,
      default: 0,
    },
    lastCollectionDate: {
      type: Date,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
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
  if (level < 5) {
    return 'Empty';
  } else if (level >= 5 && level < 60) {
    return 'Filling';
  } else if (level >= 60 && level <= 90) {
    return 'Maintenance';
  } else if (level > 90) {
    return 'Full';
  } else {
    return 'Error';
  }
};

// Index for geospatial queries
GarbageBinSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('GarbageBin', GarbageBinSchema);
