const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pricing', pricingSchema);
