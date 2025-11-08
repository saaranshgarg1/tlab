const mongoose = require('mongoose');

/**
 * Review Schema
 * Represents user feedback/reviews for garbage bins
 */
const ReviewSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    ref: 'GarbageBin',
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  name_of_user: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
ReviewSchema.index({ binId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
