const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Catalogue = require('../models/Catalogue');

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
    
    // Strict logic for Wholesale and CustomPrint orders
    if (orderType === 'Wholesale' || orderType === 'CustomPrint') {
      const liveCatalogue = await Catalogue.findOne({ isLive: true });
      if (!liveCatalogue) {
        return res.status(400).json({ message: "No live catalogue found for pricing resolution." });
      }

      let calculatedTotal = 0;
      const validatedItems = [];

      for (let item of itemsList) {
        // 1. Resolve Product in Live Catalogue
        const catItem = liveCatalogue.items.find(i => i.productId.toString() === item.productId);
        if (!catItem) {
          return res.status(400).json({ message: `Product ${item.productId} is not available in the live catalogue.` });
        }

        // 2. Validate MOQ
        if (item.qty < catItem.moq) {
          return res.status(400).json({ message: `Quantity for product ${item.productId} is below the minimum order quantity of ${catItem.moq}.` });
        }

        // 3. Override Base Price
        let finalUnitPrice = catItem.wholesalePrice;
        let customPrintPrice = 0;

        // 4. Custom Print Sizing Logic
        if (orderType === 'CustomPrint') {
          if (!item.sizeName) {
            return res.status(400).json({ message: "Custom print orders must specify a sizeName for each item." });
          }
          
          const printRule = liveCatalogue.printPricing.find(p => p.sizeName === item.sizeName);
          if (!printRule) {
            return res.status(400).json({ message: `Invalid custom print size: ${item.sizeName}` });
          }

          customPrintPrice = printRule.price;
          finalUnitPrice += customPrintPrice;
        }

        // 5. Final Calculation
        const itemTotal = finalUnitPrice * item.qty;
        calculatedTotal += itemTotal;

        validatedItems.push({
          ...item,
          price: catItem.wholesalePrice,
          customPrintPrice,
          itemTotal
        });
      }

      // Construct validated order
      const order = new Order({
        ...orderData,
        orderType,
        itemsList: validatedItems,
        total: calculatedTotal
      });

      const savedOrder = await order.save();
      return res.status(201).json(savedOrder);
    } else {
      // Retail Orders bypass catalogue validation
      const order = new Order({ orderType, itemsList, ...orderData });
      const savedOrder = await order.save();
      return res.status(201).json(savedOrder);
    }

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
