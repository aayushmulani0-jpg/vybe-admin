const express = require('express');
const router = express.Router();
const PrintLocation = require('../models/PrintLocation');

// GET all print locations
router.get('/', async (req, res) => {
  try {
    let locations = await PrintLocation.find().sort({ createdAt: 1 });
    
    if (locations.length === 0) {
      const defaultLocations = [
        { name: 'Left Chest Logo', cost: 20, boundingBox: { top: 30, left: 60, width: 10, height: 10 } },
        { name: '15 × 7 cm Chest Design', cost: 35, boundingBox: { top: 32, left: 40, width: 20, height: 10 } },
        { name: 'A4 Print', cost: 50, boundingBox: { top: 40, left: 32.5, width: 35, height: 40 } },
        { name: 'A3 Print', cost: 80, boundingBox: { top: 35, left: 27.5, width: 45, height: 55 } },
        { name: 'Sleeve Print', cost: 30, boundingBox: { top: 45, left: 25, width: 15, height: 20 } },
        { name: 'Front + Back Print', cost: 120, boundingBox: { top: 40, left: 32.5, width: 35, height: 40 } }
      ];
      await PrintLocation.insertMany(defaultLocations);
      locations = await PrintLocation.find().sort({ createdAt: 1 });
    }
    
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
