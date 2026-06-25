const mongoose = require('mongoose');

const catalogueItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  wholesalePrice: { type: Number, required: true },
  moq: { type: Number, required: true }
});

const wholesaleLocationSchema = new mongoose.Schema({
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrintLocation' },
  name: { type: String }, // Cached name for easy display
  wholesaleCost: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

const wholesaleTemplateSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  name: { type: String }, // Cached name
  wholesalePrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

const catalogueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateCreated: { type: String },
  isLive: { type: Boolean, default: false },
  items: [catalogueItemSchema],
  wholesaleLocations: [wholesaleLocationSchema],
  wholesaleTemplates: [wholesaleTemplateSchema],
});

module.exports = mongoose.model('Catalogue', catalogueSchema);
