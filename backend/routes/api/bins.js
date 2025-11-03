const express = require('express');
const router = express.Router();
const GarbageBin = require('../../models/GarbageBin');

/**
 * @route   POST /api/bins/update
 * @desc    Update bin fill level (or create new bin if doesn't exist)
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
 * @desc    Get all bins that are full
 * @access  Public
 */
router.get('/full', async (req, res) => {
  try {
    const fullBins = await GarbageBin.find({ status: 'Full' }).sort({ lastUpdated: -1 });

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

module.exports = router;
