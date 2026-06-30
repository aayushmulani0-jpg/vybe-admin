const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');
const Setting = require('../models/Setting');

// GET all pricing
router.get('/', async (req, res) => {
  try {
    const pricings = await Pricing.find();
    res.json(pricings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single pricing by id
router.get('/:id', async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing not found' });
    }
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new pricing
router.post('/', async (req, res) => {
  const { name, value, currency, type, description } = req.body;
  try {
    const newPricing = new Pricing({ name, value, currency, type, description });
    const savedPricing = await newPricing.save();
    res.status(201).json(savedPricing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update pricing
router.put('/:id', async (req, res) => {
  try {
    const updatedPricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPricing) {
      return res.status(404).json({ message: 'Pricing not found' });
    }
    res.json(updatedPricing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE pricing
router.delete('/:id', async (req, res) => {
  try {
    const deletedPricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!deletedPricing) {
      return res.status(404).json({ message: 'Pricing not found' });
    }
    res.json({ message: 'Pricing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST calculate custom print pricing
router.post('/calculate-custom-print', async (req, res) => {
  const { quantity, categoryBaseCost, printCosts } = req.body;

  try {
    let q = Math.max(0, parseInt(quantity) || 0);
    if (q < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const settings = await Setting.findOne({ singletonId: 'global_settings' });
    const adminBasePrice = settings?.general?.plainTshirtBasePrice || 499;

    let basePrice = q >= 15 ? (adminBasePrice - 14) : adminBasePrice;
    let finalBasePrice = basePrice + (categoryBaseCost || 0);
    let totalPrintCost = (printCosts || []).reduce((acc, cost) => acc + cost, 0);
    let pricePerPiece = finalBasePrice + totalPrintCost;
    let totalAmount = pricePerPiece * q;

    res.json({
      isValid: true,
      basePrice: finalBasePrice,
      printCost: totalPrintCost,
      pricePerPiece,
      totalAmount,
      q
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
