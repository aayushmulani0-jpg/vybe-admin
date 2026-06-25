const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// @route   GET /api/templates
// @desc    Get all templates (active only for users, all for admin)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find({});
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/templates
// @desc    Create a template
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const template = new Template(req.body);
    const createdTemplate = await template.save();
    res.status(201).json(createdTemplate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating template' });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update a template
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (template) {
      template.name = req.body.name || template.name;
      template.description = req.body.description || template.description;
      template.printAreas = req.body.printAreas || template.printAreas;
      template.price = req.body.price !== undefined ? req.body.price : template.price;
      template.isActive = req.body.isActive !== undefined ? req.body.isActive : template.isActive;
      template.isRecommended = req.body.isRecommended !== undefined ? req.body.isRecommended : template.isRecommended;
      template.isPopular = req.body.isPopular !== undefined ? req.body.isPopular : template.isPopular;

      const updatedTemplate = await template.save();
      res.json(updatedTemplate);
    } else {
      res.status(404).json({ message: 'Template not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating template' });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete a template
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (template) {
      await template.deleteOne();
      res.json({ message: 'Template removed' });
    } else {
      res.status(404).json({ message: 'Template not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting template' });
  }
});

module.exports = router;
