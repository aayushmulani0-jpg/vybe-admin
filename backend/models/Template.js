const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  printAreas: [{
    name: { type: String, required: true },
    top: String,
    left: String,
    width: String,
    height: String,
    transform: String
  }],
  price: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true },
  isRecommended: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
