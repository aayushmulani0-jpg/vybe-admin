const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  stockStatus: { type: String, default: 'In Stock' },
  discountBadge: { type: String },
  image: { type: String, required: true },
  description: { type: String },
  sizes: [{ type: String, enum: ['S', 'M', 'L', 'XL'] }],
  outOfStockSizes: [{ type: String }],
  colors: [{ type: String }],
  outOfStockColors: [{ type: String }],
  images: [{ type: String }],
  allowCustomPrint: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
