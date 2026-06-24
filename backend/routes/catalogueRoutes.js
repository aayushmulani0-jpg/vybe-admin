const express = require('express');
const router = express.Router();
const Catalogue = require('../models/Catalogue');

// Get all catalogues (Admin)
router.get('/', async (req, res) => {
  try {
    // Populate the nested products to get image, name, retail price
    const catalogues = await Catalogue.find().populate('items.productId').sort({ dateCreated: -1 });
    res.json(catalogues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Live Catalogue (User Storefront)
router.get('/live', async (req, res) => {
  try {
    const liveCatalogue = await Catalogue.findOne({ isLive: true }).populate('items.productId');
    if (!liveCatalogue) {
      return res.status(404).json({ message: 'No live catalogue available.' });
    }
    res.json(liveCatalogue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create catalogue
router.post('/', async (req, res) => {
  try {
    const catalogue = new Catalogue({
      ...req.body,
      dateCreated: new Date().toISOString().split('T')[0]
    });
    
    // If it's the first catalogue, make it live automatically
    const count = await Catalogue.countDocuments();
    if (count === 0) {
      catalogue.isLive = true;
    }
    
    const savedCatalogue = await catalogue.save();
    res.status(201).json(savedCatalogue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update catalogue (for items, print pricing, name)
router.put('/:id', async (req, res) => {
  try {
    const updatedCatalogue = await Catalogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCatalogue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Set Catalogue as Live (and turn others off)
router.put('/:id/live', async (req, res) => {
  try {
    await Catalogue.updateMany({}, { isLive: false });
    const liveCatalogue = await Catalogue.findByIdAndUpdate(req.params.id, { isLive: true }, { new: true });
    res.json(liveCatalogue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete catalogue
router.delete('/:id', async (req, res) => {
  try {
    await Catalogue.findByIdAndDelete(req.params.id);
    res.json({ message: 'Catalogue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
