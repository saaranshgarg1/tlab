const express = require('express');
const router = express.Router();
const GarbageBin = require('../../models/GarbageBin');
const Collection = require('../../models/Collection');
const History = require('../../models/History');
const Review = require('../../models/Review');

/**
 * @route   GET /api/analytics/summary
 * @desc    Get aggregated KPIs and analytics
 * @query   from - Start date (ISO format)
 * @query   to - End date (ISO format)
 * @access  Public
 */
router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;

    // Build date query
    const dateQuery = {};
    if (from || to) {
      dateQuery.timestamp = {};
      if (from) dateQuery.timestamp.$gte = new Date(from);
      if (to) dateQuery.timestamp.$lte = new Date(to);
    }

    // Get all bins
    const allBins = await GarbageBin.find();
    const totalBins = allBins.length;

    // Count bins by status
    const emptyBins = allBins.filter(b => b.status === 'Empty').length;
    const fillingBins = allBins.filter(b => b.status === 'Filling').length;
    const fullBins = allBins.filter(b => b.status === 'Full').length;
    const maintenanceBins = allBins.filter(b => b.maintenanceFlag).length;

    // Calculate average fill level
    const averageFillLevel = totalBins > 0
      ? Math.round(allBins.reduce((sum, b) => sum + b.fillLevel, 0) / totalBins)
      : 0;

    // Get collections data
    const collectionQuery = {};
    if (from || to) {
      collectionQuery.createdAt = {};
      if (from) collectionQuery.createdAt.$gte = new Date(from);
      if (to) collectionQuery.createdAt.$lte = new Date(to);
    }

    const collections = await Collection.find(collectionQuery);
    const totalCollections = collections.length;
    const scheduledCollections = collections.filter(c => c.status === 'Scheduled').length;
    const completedCollections = collections.filter(c => c.status === 'Completed').length;
    const inProgressCollections = collections.filter(c => c.status === 'In Progress').length;

    // Get reviews data
    const reviewQuery = {};
    if (from || to) {
      reviewQuery.createdAt = {};
      if (from) reviewQuery.createdAt.$gte = new Date(from);
      if (to) reviewQuery.createdAt.$lte = new Date(to);
    }

    const reviews = await Review.find(reviewQuery);
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews) * 10) / 10
      : 0;

    // Calculate fill level distribution
    const fillLevelDistribution = {
      '0-20': allBins.filter(b => b.fillLevel >= 0 && b.fillLevel <= 20).length,
      '21-40': allBins.filter(b => b.fillLevel >= 21 && b.fillLevel <= 40).length,
      '41-60': allBins.filter(b => b.fillLevel >= 41 && b.fillLevel <= 60).length,
      '61-80': allBins.filter(b => b.fillLevel >= 61 && b.fillLevel <= 80).length,
      '81-100': allBins.filter(b => b.fillLevel >= 81 && b.fillLevel <= 100).length,
    };

    // Get bins requiring attention (high fill level or maintenance)
    const binsRequiringAttention = allBins.filter(
      b => b.fillLevel > b.threshold || b.maintenanceFlag
    ).length;

    // Calculate collection efficiency (if applicable)
    const avgCollectionInterval = totalCollections > 1
      ? Math.round(
          collections
            .filter(c => c.completedAt)
            .reduce((sum, c, i, arr) => {
              if (i === 0) return 0;
              return sum + (c.completedAt - arr[i - 1].completedAt);
            }, 0) /
            (collections.filter(c => c.completedAt).length - 1) /
            (1000 * 60 * 60 * 24)
        ) // Convert to days
      : 0;

    // Top performing bins (by cleanliness rating)
    const topRatedBins = allBins
      .filter(b => b.stats.averageRating > 0)
      .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
      .slice(0, 5)
      .map(b => ({
        binId: b.binId,
        location: b.location,
        rating: b.stats.averageRating,
        reviews: b.stats.totalReviews,
      }));

    // Bins needing urgent attention
    const urgentBins = allBins
      .filter(b => b.fillLevel >= 80 || (b.fillLevel > b.threshold && b.maintenanceFlag))
      .sort((a, b) => b.fillLevel - a.fillLevel)
      .slice(0, 10)
      .map(b => ({
        binId: b.binId,
        location: b.location,
        fillLevel: b.fillLevel,
        status: b.status,
        maintenanceFlag: b.maintenanceFlag,
      }));

    // Get history trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentHistory = await History.find({
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: 1 });

    // Group by day for trend
    const trends = {};
    recentHistory.forEach(entry => {
      const day = entry.timestamp.toISOString().split('T')[0];
      if (!trends[day]) {
        trends[day] = { fills: [], count: 0 };
      }
      trends[day].fills.push(entry.fillLevel);
      trends[day].count++;
    });

    const fillLevelTrend = Object.entries(trends).map(([date, data]) => ({
      date,
      averageFill: Math.round(data.fills.reduce((a, b) => a + b, 0) / data.count),
      updates: data.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBins,
          emptyBins,
          fillingBins,
          fullBins,
          maintenanceBins,
          binsRequiringAttention,
          averageFillLevel,
        },
        collections: {
          total: totalCollections,
          scheduled: scheduledCollections,
          inProgress: inProgressCollections,
          completed: completedCollections,
          avgInterval: avgCollectionInterval,
        },
        reviews: {
          total: totalReviews,
          averageRating,
        },
        distribution: fillLevelDistribution,
        topRatedBins,
        urgentBins,
        trends: fillLevelTrend,
      },
      period: {
        from: from || 'all time',
        to: to || 'now',
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/analytics/collection-stats
 * @desc    Get detailed collection statistics
 * @access  Public
 */
router.get('/collection-stats', async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = {};
    if (from || to) {
      query.scheduledDate = {};
      if (from) query.scheduledDate.$gte = new Date(from);
      if (to) query.scheduledDate.$lte = new Date(to);
    }

    const collections = await Collection.find(query);

    // Group by status
    const byStatus = {
      Scheduled: collections.filter(c => c.status === 'Scheduled').length,
      'In Progress': collections.filter(c => c.status === 'In Progress').length,
      Completed: collections.filter(c => c.status === 'Completed').length,
      Cancelled: collections.filter(c => c.status === 'Cancelled').length,
    };

    // Auto-scheduled vs manual
    const autoScheduled = collections.filter(c => c.autoScheduled).length;
    const manualScheduled = collections.length - autoScheduled;

    // Average fill level at collection
    const completedWithFillLevel = collections.filter(
      c => c.status === 'Completed' && c.fillLevelAtCollection != null
    );
    const avgFillAtCollection = completedWithFillLevel.length > 0
      ? Math.round(
          completedWithFillLevel.reduce((sum, c) => sum + c.fillLevelAtCollection, 0) /
            completedWithFillLevel.length
        )
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total: collections.length,
        byStatus,
        scheduling: {
          autoScheduled,
          manualScheduled,
        },
        avgFillAtCollection,
      },
    });
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;
