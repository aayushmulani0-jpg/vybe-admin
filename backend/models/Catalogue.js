const mongoose = require('mongoose');

const catalogueItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  wholesalePrice: { type: Number, required: true },
  moq: { type: Number, required: true }
});

const printPricingSchema = new mongoose.Schema({
  sizeName: { type: String, required: true },
  dimensionsCm: { type: String, required: true },
  price: { type: Number, required: true }
});

const catalogueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateCreated: { type: String },
  isLive: { type: Boolean, default: false },
  items: [catalogueItemSchema],
  printPricing: [printPricingSchema],
});

module.exports = mongoose.model('Catalogue', catalogueSchema);
