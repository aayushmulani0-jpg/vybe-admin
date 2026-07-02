require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./db');
const path = require('path');

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy for Render/load balancers so rate limiter gets correct IPs
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting: max 1000 requests per hour from same IP
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  // If FRONTEND_URL is set, use it. Otherwise, use a function to reflect the request origin
  // (which is required when credentials: true is set, because '*' is forbidden).
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',') 
    : function (origin, callback) { callback(null, true); },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('Vybe API is running... (v1.1.0 Optimized)');
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

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('ERROR 💥', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
