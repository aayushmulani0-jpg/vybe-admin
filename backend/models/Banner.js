const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  ctaText: { type: String },
  ctaUrl: { type: String },
  discountPercentage: { type: Number },
  couponCode: { type: String },
  type: { type: String, required: true },
  desktopImage: { type: String, required: true },
  mobileImage: { type: String },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  displayPriority: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
