const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get global settings (create default if none exist)
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne({ singletonId: 'global_settings' });
    if (!settings) {
      settings = await Setting.create({});
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
});

// Update global settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    let settings = await Setting.findOneAndUpdate(
      { singletonId: 'global_settings' },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
});

module.exports = router;
