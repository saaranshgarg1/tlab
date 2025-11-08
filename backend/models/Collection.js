const mongoose = require('mongoose');

/**
 * Collection Schema
 * Represents scheduled or completed garbage collections
 */
const CollectionSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    ref: 'GarbageBin',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  fillLevelAtSchedule: {
    type: Number,
    min: 0,
    max: 100,
  },
  fillLevelAtCollection: {
    type: Number,
    min: 0,
    max: 100,
  },
  collectedBy: {
    type: String,
    trim: true,
  },
  completedAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  autoScheduled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for queries
CollectionSchema.index({ binId: 1, scheduledDate: -1 });
CollectionSchema.index({ status: 1, scheduledDate: 1 });
CollectionSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Collection', CollectionSchema);
