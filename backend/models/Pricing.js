const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  action: { type: String, enum: ['add', 'subtract'], default: 'add' },
  minSubtotal: { type: Number, default: 0 },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pricing', pricingSchema);
