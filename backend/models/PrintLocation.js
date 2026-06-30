const mongoose = require('mongoose');

const printLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  boundingBox: {
    top: { type: Number, default: 30 },
    left: { type: Number, default: 40 },
    width: { type: Number, default: 20 },
    height: { type: Number, default: 20 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PrintLocation', printLocationSchema);
