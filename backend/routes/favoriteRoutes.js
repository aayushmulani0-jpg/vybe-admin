const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/favorites
// @desc    Get current user's favorite product IDs (populated)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, favorites: user.favorites || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/favorites/ids
// @desc    Get just the favorite product IDs (lightweight, for syncing)
// @access  Private
router.get('/ids', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favorites');
    res.json({ success: true, favoriteIds: user.favorites || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/favorites/:productId
// @desc    Add a product to favorites
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save({ validateModifiedOnly: true });
    }

    res.json({ success: true, favoriteIds: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/favorites/:productId
// @desc    Remove a product from favorites
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save({ validateModifiedOnly: true });

    res.json({ success: true, favoriteIds: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/favorites/sync
// @desc    Sync local favorites to backend (bulk merge)
// @access  Private
router.post('/sync', protect, async (req, res) => {
  try {
    const { favoriteIds } = req.body;
    if (!Array.isArray(favoriteIds)) {
      return res.status(400).json({ success: false, message: 'favoriteIds must be an array' });
    }

    const user = await User.findById(req.user._id);
    const existingSet = new Set(user.favorites.map(id => id.toString()));
    
    favoriteIds.forEach(id => {
      if (!existingSet.has(id)) {
        user.favorites.push(id);
      }
    });

    await user.save({ validateModifiedOnly: true });
    res.json({ success: true, favoriteIds: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
