const express = require('express');
const router = express.Router();
const PrintLocation = require('../models/PrintLocation');

// GET all print locations
router.get('/', async (req, res) => {
  try {
    let locations = await PrintLocation.find().sort({ createdAt: 1 });
    

    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active print locations
router.get('/active', async (req, res) => {
  try {
    const locations = await PrintLocation.find({ isActive: true }).sort({ createdAt: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new print location
router.post('/', async (req, res) => {
  try {
    const newLocation = new PrintLocation(req.body);
    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update print location
router.put('/:id', async (req, res) => {
  try {
    const updatedLocation = await PrintLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(updatedLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE print location
router.delete('/:id', async (req, res) => {
  try {
    const deletedLocation = await PrintLocation.findByIdAndDelete(req.params.id);
    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
