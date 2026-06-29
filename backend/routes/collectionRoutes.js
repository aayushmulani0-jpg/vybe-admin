const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().populate('products').sort({ displayOrder: 1 });
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active collections
router.get('/active', async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).populate('products').sort({ displayOrder: 1 });
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single collection
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('products');
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create collection
router.post('/', async (req, res) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    res.status(201).json({ success: true, collection });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update collection
router.put('/:id', async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, collection });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
