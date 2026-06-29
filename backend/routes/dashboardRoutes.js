const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const orders = await Order.find({});
    
    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const retailOrdersCount = orders.filter(o => o.orderType === 'Retail').length;
    const customOrdersCount = orders.filter(o => o.orderType === 'CustomPrint' && o.status !== 'Completed').length;
    
    // Customers count
    const customersCount = await User.countDocuments({ role: 'user' });

    // Products count
    const totalProducts = await Product.countDocuments();

    // Revenue Overview for current year
    const monthlyRevenue = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(m => monthlyRevenue[m] = 0);

    const currentYear = new Date().getFullYear();
    orders.forEach(order => {
      const date = new Date(order.createdAt || order.date || Date.now());
      if (date.getFullYear() === currentYear) {
        const month = months[date.getMonth()];
        monthlyRevenue[month] += (Number(order.total) || 0);
      }
    });

    const revenueOverview = months.map(name => ({
      name,
      revenue: monthlyRevenue[name]
    }));

    // Recent Activity (last 5 orders)
    const recentActivity = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        retailOrdersCount,
        customOrdersCount,
        customersCount,
        totalProducts
      },
      revenueOverview,
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
