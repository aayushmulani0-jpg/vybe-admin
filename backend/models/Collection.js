const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String, required: true },
  bannerImage: { type: String },
  coverImage: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
