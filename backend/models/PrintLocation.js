const mongoose = require('mongoose');

const printLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PrintLocation', printLocationSchema);
