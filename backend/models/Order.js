const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String },
  qty: { type: Number },
  price: { type: Number },
  image: { type: String },
  sizeName: { type: String },
  selectedSize: { type: String },
  selectedColor: { type: String },
  selectedPrints: [{
    name: { type: String },
    cost: { type: Number }
  }],
  customPrintPrice: { type: Number, default: 0 },
  itemTotal: { type: Number },
  uploadedImages: { type: Object }
});

const orderSchema = new mongoose.Schema({
  orderType: { type: String, enum: ['Retail', 'Wholesale', 'CustomPrint'], required: true },
  
  // Shared fields
  customer: { type: String },
  email: { type: String },
  phone: { type: String },
  date: { type: String },
  total: { type: Number },
  status: { type: String },
  items: { type: Number },
  shippingAddress: { type: String },
  itemsList: [orderItemSchema],

  // Financials
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },

  // Logistics
  shippingDetails: {
    courier: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    estimatedDelivery: { type: Date }
  },

  // Wholesale specific
  company: { type: String },
  contact: { type: String },

  // Custom Print specific
  baseProduct: { type: String },
  color: { type: String },
  printLocation: { type: String },
  dimensions: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  notes: { type: String },
  designUrl: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
