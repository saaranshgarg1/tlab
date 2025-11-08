const express = require('express');
const router = express.Router();
const GarbageBin = require('../../models/GarbageBin');
const Collection = require('../../models/Collection');
const History = require('../../models/History');
const Review = require('../../models/Review');

/**
 * @route   POST /api/bins/update
 * @desc    Update bin fill level (or create new bin if doesn't exist)
 *          Auto-schedules collection if fillLevel > threshold and not already scheduled
 *          Auto-completes scheduled collections when fillLevel drops below 60
 * @access  Public
 */
router.post('/update', async (req, res) => {
  try {
    const { binId, fillLevel, location } = req.body;

    // Validate required fields
    if (!binId || fillLevel === undefined || fillLevel === null) {
      return res.status(400).json({
        success: false,
        message: 'binId and fillLevel are required',
      });
    }

    // Validate fill level range
    if (fillLevel < 0 || fillLevel > 100) {
      return res.status(400).json({
        success: false,
        message: 'fillLevel must be between 0 and 100',
      });
    }

    // Determine status based on fill level
    const status = GarbageBin.determineStatus(fillLevel);

    // Find and update bin, or create if it doesn't exist
    let bin = await GarbageBin.findOneAndUpdate(
      { binId },
      {
        binId,
        fillLevel,
        status,
        lastUpdated: Date.now(),
        ...(location && { location }), // Only update location if provided
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        runValidators: true, // Run schema validators
        setDefaultsOnInsert: true, // Set default values on insert
      }
    );

    // Save history entry for analytics
    await History.create({
      binId,
      fillLevel,
      status,
      timestamp: new Date(),
    });

    // Auto-complete scheduled collections when fill level drops below 60
    let collectionCompleted = false;
    if (fillLevel < 60) {
      const pendingCollections = await Collection.find({
        binId,
        status: { $in: ['Scheduled', 'In Progress'] },
      });

      if (pendingCollections.length > 0) {
        // Mark all pending collections as completed
        const completedAt = new Date();
        
        for (const collection of pendingCollections) {
          collection.status = 'Completed';
          collection.fillLevelAtCollection = fillLevel;
          collection.completedAt = completedAt;
          await collection.save();
          collectionCompleted = true;
        }

        // Update bin collection stats
        bin.stats.totalCollections = (bin.stats.totalCollections || 0) + pendingCollections.length;
        bin.stats.lastCollectionDate = completedAt;
        
        // Calculate average fill rate (simplified: average of all history entries)
        const recentHistory = await History.find({ binId })
          .sort({ timestamp: -1 })
          .limit(100);
        
        if (recentHistory.length > 0) {
          const avgFillLevel = recentHistory.reduce((sum, h) => sum + h.fillLevel, 0) / recentHistory.length;
          bin.stats.averageFillRate = Math.round(avgFillLevel * 10) / 10;
        }
        
        await bin.save();
      }
    }

    // Auto-schedule collection if fillLevel exceeds threshold
    let collectionScheduled = false;
    if (fillLevel > bin.threshold) {
      // Check if there's already a pending collection scheduled
      const existingCollection = await Collection.findOne({
        binId,
        status: { $in: ['Scheduled', 'In Progress'] },
      });

      if (!existingCollection) {
        // Schedule a new collection for tomorrow
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 1);
        scheduledDate.setHours(9, 0, 0, 0); // 9 AM next day

        await Collection.create({
          binId,
          scheduledDate,
          fillLevelAtSchedule: fillLevel,
          autoScheduled: true,
          status: 'Scheduled',
        });

        collectionScheduled = true;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bin updated successfully',
      data: bin,
      collectionScheduled,
      collectionCompleted,
    });
  } catch (error) {
    console.error('Error updating bin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/bins
 * @desc    Create a new bin (admin)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { binId, location, lat, lng, label, threshold } = req.body;

    // Validate required fields
    if (!binId) {
      return res.status(400).json({
        success: false,
        message: 'binId is required',
      });
    }

    // Check if bin already exists
    const existingBin = await GarbageBin.findOne({ binId });
    if (existingBin) {
      return res.status(400).json({
        success: false,
        message: `Bin with ID '${binId}' already exists`,
      });
    }

    // Create new bin
    const bin = await GarbageBin.create({
      binId,
      location: location || 'Default Location',
      lat,
      lng,
      label,
      threshold: threshold || 60,
      fillLevel: 0,
      status: 'Empty',
    });

    res.status(201).json({
      success: true,
      message: 'Bin created successfully',
      data: bin,
    });
  } catch (error) {
    console.error('Error creating bin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/status
 * @desc    Get status of all bins
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const bins = await GarbageBin.find().sort({ lastUpdated: -1 });

    res.status(200).json({
      success: true,
      count: bins.length,
      data: bins,
    });
  } catch (error) {
    console.error('Error fetching bins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/full
 * @desc    Get all bins that are full (fillLevel >= threshold)
 * @access  Public
 */
router.get('/full', async (req, res) => {
  try {
    const fullBins = await GarbageBin.find({
      $expr: { $gte: ['$fillLevel', '$threshold'] }
    }).sort({ fillLevel: -1 });

    res.status(200).json({
      success: true,
      count: fullBins.length,
      data: fullBins,
    });
  } catch (error) {
    console.error('Error fetching full bins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/status/:binId
 * @desc    Get status of a specific bin
 * @access  Public
 */
router.get('/status/:binId', async (req, res) => {
  try {
    const { binId } = req.params;

    const bin = await GarbageBin.findOne({ binId });

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: bin,
    });
  } catch (error) {
    console.error('Error fetching bin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/:binId/stats
 * @desc    Get comprehensive statistics for a specific bin
 * @access  Public
 */
router.get('/:binId/stats', async (req, res) => {
  try {
    const { binId } = req.params;

    // Verify bin exists and get basic info
    const bin = await GarbageBin.findOne({ binId });
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    // Get recent history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHistory = await History.find({
      binId,
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: -1 }).limit(720); // 30 days * 24 hours

    // Get upcoming collections
    const upcomingCollections = await Collection.find({
      binId,
      status: { $in: ['Scheduled', 'In Progress'] }
    }).sort({ scheduledDate: 1 });

    // Get recent completed collections
    const completedCollections = await Collection.find({
      binId,
      status: 'Completed'
    }).sort({ completedAt: -1 }).limit(10);

    // Get all reviews
    const reviews = await Review.find({ binId }).sort({ createdAt: -1 });

    // Calculate fill rate trend (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const lastWeekHistory = await History.find({
      binId,
      timestamp: { $gte: sevenDaysAgo }
    });

    const previousWeekHistory = await History.find({
      binId,
      timestamp: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });

    const lastWeekAvg = lastWeekHistory.length > 0 
      ? lastWeekHistory.reduce((sum, h) => sum + h.fillLevel, 0) / lastWeekHistory.length 
      : 0;

    const previousWeekAvg = previousWeekHistory.length > 0 
      ? previousWeekHistory.reduce((sum, h) => sum + h.fillLevel, 0) / previousWeekHistory.length 
      : 0;

    const fillRateTrend = previousWeekAvg > 0 
      ? ((lastWeekAvg - previousWeekAvg) / previousWeekAvg * 100) 
      : 0;

    // Calculate average time to fill (from last collections)
    let avgTimeToFill = null;
    if (completedCollections.length >= 2) {
      const timeDiffs = [];
      for (let i = 0; i < completedCollections.length - 1; i++) {
        const timeDiff = completedCollections[i].completedAt - completedCollections[i + 1].completedAt;
        timeDiffs.push(timeDiff);
      }
      const avgTimeDiff = timeDiffs.reduce((sum, t) => sum + t, 0) / timeDiffs.length;
      avgTimeToFill = Math.round(avgTimeDiff / (1000 * 60 * 60 * 24)); // Convert to days
    }

    // Predict next collection date based on average time to fill and current level
    let predictedNextCollection = null;
    if (avgTimeToFill && bin.fillLevel < bin.threshold) {
      const fillRate = bin.threshold / avgTimeToFill; // % per day
      const daysUntilFull = (bin.threshold - bin.fillLevel) / fillRate;
      predictedNextCollection = new Date();
      predictedNextCollection.setDate(predictedNextCollection.getDate() + Math.ceil(daysUntilFull));
    }

    // Compile statistics
    const stats = {
      binInfo: {
        binId: bin.binId,
        location: bin.location,
        currentFillLevel: bin.fillLevel,
        status: bin.status,
        threshold: bin.threshold,
        maintenanceFlag: bin.maintenanceFlag,
        label: bin.label,
        lastUpdated: bin.lastUpdated,
      },
      collectionStats: {
        totalCollections: bin.stats.totalCollections || 0,
        lastCollectionDate: bin.stats.lastCollectionDate,
        upcomingCollections: upcomingCollections.length,
        nextScheduledCollection: upcomingCollections[0]?.scheduledDate || null,
        recentCollections: completedCollections.map(c => ({
          scheduledDate: c.scheduledDate,
          completedAt: c.completedAt,
          fillLevelAtSchedule: c.fillLevelAtSchedule,
          fillLevelAtCollection: c.fillLevelAtCollection,
          collectedBy: c.collectedBy,
        })),
        averageTimeToFill: avgTimeToFill,
        predictedNextCollection,
      },
      fillLevelStats: {
        current: bin.fillLevel,
        averageFillRate: bin.stats.averageFillRate || 0,
        lastWeekAverage: Math.round(lastWeekAvg * 10) / 10,
        previousWeekAverage: Math.round(previousWeekAvg * 10) / 10,
        fillRateTrend: Math.round(fillRateTrend * 10) / 10,
        historyDataPoints: recentHistory.length,
      },
      reviewStats: {
        totalReviews: bin.stats.totalReviews || 0,
        averageRating: bin.stats.averageRating || 0,
        recentReviews: reviews.slice(0, 5).map(r => ({
          name_of_user: r.name_of_user,
          stars: r.stars,
          text: r.text,
          createdAt: r.createdAt,
        })),
      },
      recentHistory: recentHistory.slice(0, 100).map(h => ({
        fillLevel: h.fillLevel,
        status: h.status,
        timestamp: h.timestamp,
      })),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching bin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/bins/:binId
 * @desc    Update bin metadata (admin)
 * @access  Public
 */
router.put('/:binId', async (req, res) => {
  try {
    const { binId } = req.params;
    const { location, lat, lng, label, threshold, maintenanceFlag } = req.body;

    const bin = await GarbageBin.findOne({ binId });

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    // Update fields
    if (location !== undefined) bin.location = location;
    if (lat !== undefined) bin.lat = lat;
    if (lng !== undefined) bin.lng = lng;
    if (label !== undefined) bin.label = label;
    if (threshold !== undefined) bin.threshold = threshold;
    if (maintenanceFlag !== undefined) bin.maintenanceFlag = maintenanceFlag;

    await bin.save();

    res.status(200).json({
      success: true,
      message: 'Bin updated successfully',
      data: bin,
    });
  } catch (error) {
    console.error('Error updating bin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/bins/:binId
 * @desc    Delete a bin (admin)
 * @access  Public
 */
router.delete('/:binId', async (req, res) => {
  try {
    const { binId } = req.params;

    const bin = await GarbageBin.findOneAndDelete({ binId });

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    // Clean up related data
    await Promise.all([
      History.deleteMany({ binId }),
      Collection.deleteMany({ binId }),
      Review.deleteMany({ binId }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Bin and related data deleted successfully',
      data: bin,
    });
  } catch (error) {
    console.error('Error deleting bin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/:binId/history
 * @desc    Get time-series fill level history for a bin
 * @query   from - Start date (ISO format)
 * @query   to - End date (ISO format)
 * @query   interval - Grouping interval (hour, day, week)
 * @access  Public
 */
router.get('/:binId/history', async (req, res) => {
  try {
    const { binId } = req.params;
    const { from, to, interval = 'hour' } = req.query;

    // Verify bin exists
    const bin = await GarbageBin.findOne({ binId });
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    // Build query
    const query = { binId };
    
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    // Fetch history data
    const historyData = await History.find(query)
      .sort({ timestamp: 1 })
      .lean();

    // Group by interval if needed
    let series = historyData.map(entry => ({
      ts: entry.timestamp,
      fill: entry.fillLevel,
      status: entry.status,
    }));

    // Simple interval grouping (can be enhanced with aggregation)
    if (interval === 'day') {
      const grouped = {};
      series.forEach(entry => {
        const day = entry.ts.toISOString().split('T')[0];
        if (!grouped[day]) {
          grouped[day] = { ts: day, fills: [], statuses: [] };
        }
        grouped[day].fills.push(entry.fill);
        grouped[day].statuses.push(entry.status);
      });
      
      series = Object.values(grouped).map(g => ({
        ts: g.ts,
        fill: Math.round(g.fills.reduce((a, b) => a + b, 0) / g.fills.length),
        status: g.statuses[g.statuses.length - 1],
      }));
    }

    res.status(200).json({
      success: true,
      binId,
      series,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/bins/:binId/review
 * @desc    Submit a cleanliness review for a bin
 * @access  Public
 */
router.post('/:binId/review', async (req, res) => {
  try {
    const { binId } = req.params;
    const { stars, text, name_of_user } = req.body;

    // Validate required fields
    if (!stars || !name_of_user) {
      return res.status(400).json({
        success: false,
        message: 'stars and name_of_user are required',
      });
    }

    // Validate stars range
    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: 'stars must be between 1 and 5',
      });
    }

    // Verify bin exists
    const bin = await GarbageBin.findOne({ binId });
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    // Create review
    const review = await Review.create({
      binId,
      stars,
      text,
      name_of_user,
    });

    // Update bin stats
    const allReviews = await Review.find({ binId });
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews;

    bin.stats.totalReviews = totalReviews;
    bin.stats.averageRating = Math.round(averageRating * 10) / 10;
    await bin.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/:binId/reviews
 * @desc    Get all reviews for a bin
 * @access  Public
 */
router.get('/:binId/reviews', async (req, res) => {
  try {
    const { binId } = req.params;
    const { limit = 50 } = req.query;

    const reviews = await Review.find({ binId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bins/:binId/collection
 * @desc    Get collection schedule for a bin
 * @access  Public
 */
router.get('/:binId/collection', async (req, res) => {
  try {
    const { binId } = req.params;
    const { status } = req.query;

    // Verify bin exists
    const bin = await GarbageBin.findOne({ binId });
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: `Bin with ID '${binId}' not found`,
      });
    }

    // Build query
    const query = { binId };
    if (status) {
      query.status = status;
    }

    const collections = await Collection.find(query)
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      data: collections,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;
