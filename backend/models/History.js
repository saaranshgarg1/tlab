const mongoose = require('mongoose');

/**
 * History Schema
 * Tracks fill level changes over time for analytics and charts
 */
const HistorySchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    ref: 'GarbageBin',
  },
  fillLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['Empty', 'Filling', 'Full', 'Error'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Indexes for time-series queries
HistorySchema.index({ binId: 1, timestamp: -1 });
HistorySchema.index({ timestamp: 1 });

// TTL index to automatically delete old data after 90 days (optional)
// HistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('History', HistorySchema);
