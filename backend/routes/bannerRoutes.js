const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active banners
router.get('/active', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create banner
router.post('/', async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update banner
router.put('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete banner
router.delete('/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
