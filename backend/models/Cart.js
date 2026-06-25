const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cartId: { type: String, required: true }, // The unique ID for the item inside the cart (useful for frontend removal)
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Can be null if it's a custom print
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String },
  selectedSize: { type: String },
  selectedColor: { type: String },
  // Custom Print Specifics
  selectedPrints: { type: Array, default: [] },
  uploadedImages: { type: Object, default: {} },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // 1 cart per user
  },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
