const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Catalogue = require('../models/Catalogue');
const { protect } = require('../middleware/authMiddleware');

// Get my orders (for logged-in user)
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders by type
router.get('/', async (req, res) => {
  try {
    const type = req.query.type; // Retail, Wholesale, or CustomPrint
    const query = type ? { orderType: type } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { orderType, itemsList, ...orderData } = req.body;
    
    const calculatedTotal = itemsList.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);
    const itemsCount = itemsList.reduce((sum, item) => sum + (item.qty || 1), 0);

    let statusDefault = 'Pending';
    if (orderType === 'CustomPrint') statusDefault = 'New Order';

    const order = new Order({ 
      orderType: orderType || 'Retail',
      itemsList, 
      total: calculatedTotal,
      items: itemsCount,
      status: statusDefault,
      date: new Date().toISOString().split('T')[0],
      ...orderData 
    });
    const savedOrder = await order.save();
    return res.status(201).json(savedOrder);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order details (status, payment, shipping)
router.put('/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.paymentStatus) updateData.paymentStatus = req.body.paymentStatus;
    if (req.body.shippingDetails) updateData.shippingDetails = req.body.shippingDetails;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
