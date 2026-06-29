require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('Vybe API is running...');
});

// Import Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/catalogues', require('./routes/catalogueRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/print-locations', require('./routes/printLocationRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
