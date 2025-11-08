require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/bins', require('./routes/api/bins'));
app.use('/api/analytics', require('./routes/api/analytics'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Garbage Monitoring System API',
    version: '2.0.0',
    endpoints: {
      bins: {
        'POST /api/bins': 'Create new bin (admin)',
        'POST /api/bins/update': 'Update bin fill level (auto-schedules collection if needed)',
        'GET /api/bins/status': 'Get all bins status',
        'GET /api/bins/status/:binId': 'Get specific bin status',
        'GET /api/bins/full': 'Get all full bins (fillLevel >= threshold)',
        'PUT /api/bins/:binId': 'Update bin metadata (admin)',
        'DELETE /api/bins/:binId': 'Delete bin (admin)',
        'GET /api/bins/:binId/history': 'Get time-series fill level data',
        'POST /api/bins/:binId/review': 'Submit cleanliness review',
        'GET /api/bins/:binId/reviews': 'Get all reviews for a bin',
        'GET /api/bins/:binId/collection': 'Get collection schedule for a bin',
      },
      analytics: {
        'GET /api/analytics/summary': 'Get aggregated KPIs and statistics',
        'GET /api/analytics/collection-stats': 'Get detailed collection statistics',
      },
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
