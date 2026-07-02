const express = require('express'); // Restart backend for auth changes
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { protect, admin } = require('../middleware/authMiddleware');

// We will use a mock JWT secret if it is not provided in env for now, 
// but it should ideally be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'vybe-super-secret-key-123';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');

// Helper to generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/check-admin
// @desc    Check if an admin exists
router.get('/check-admin', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    res.json({ hasAdmin: adminCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register-admin
// @desc    Register the first admin
router.post('/register-admin', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= 1) {
      return res.status(403).json({ message: 'An admin account already exists. Only 1 admin is allowed.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  const { email, password, isAdminLogin } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Please login with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (isAdminLogin) {
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      const tempToken = jwt.sign({ tempId: user._id }, JWT_SECRET, { expiresIn: '5m' });
      return res.json({ requiresOtp: true, tempToken });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for admin login
router.post('/verify-otp', async (req, res) => {
  const { tempToken, otp } = req.body;
  if (otp !== '696969') {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  
  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    const user = await User.findById(decoded.tempId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.activeTokens && user.activeTokens.length >= 2) {
      return res.status(403).json({ message: 'Maximum 2 active sessions allowed. Please log out from another device.' });
    }
    
    const finalToken = generateToken(user._id);
    
    user.activeTokens = user.activeTokens || [];
    user.activeTokens.push(finalToken);
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: finalToken
    });
  } catch (err) {
    res.status(401).json({ message: 'Session expired or invalid token' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout admin and free session
router.post('/logout', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const token = req.headers.authorization.split(' ')[1];
      user.activeTokens = (user.activeTokens || []).filter(t => t !== token);
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register user with Google
router.post('/google', async (req, res) => {
  const { tokenId } = req.body;
  try {
    // Note: In production you MUST verify the tokenId using googleClient.verifyIdToken
    // For local dev without a real CLIENT_ID, we'll extract the payload directly.
    const decoded = jwt.decode(tokenId);
    
    if (!decoded || !decoded.email) {
       return res.status(400).json({ message: 'Invalid Google Token' });
    }

    const { email, name, sub: googleId } = decoded;

    let user = await User.findOne({ email });

    if (user) {
      // User exists, login
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      // User doesn't exist, create one
      user = new User({
        name,
        email,
        googleId
      });
      await user.save();
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error with Google Login' });
  }
});

// @route   GET /api/auth/customers
// @desc    Get all registered users for Admin panel
// @access  Public (Temporary for Admin)
router.get('/customers', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

// @route   GET /api/auth/me/addresses
// @desc    Get current user addresses
// @access  Private
router.get('/me/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.addresses || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching addresses' });
  }
});

// @route   POST /api/auth/me/addresses
// @desc    Add a new address for the current user
// @access  Private
router.post('/me/addresses', protect, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized. Please log in again.' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const newAddress = req.body;
    if (newAddress.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    user.addresses.push(newAddress);
    await user.save({ validateModifiedOnly: true });
    res.json(user.addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error adding address: ${err.message}` });
  }
});

// @route   DELETE /api/auth/me/addresses/:id
// @desc    Delete an address for the current user
// @access  Private
router.delete('/me/addresses/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save({ validateModifiedOnly: true });
    res.json(user.addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting address' });
  }
});

// @route   PUT /api/auth/me/addresses/:id
// @desc    Update an address for the current user
// @access  Private
router.put('/me/addresses/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const addressId = req.params.id;
    const updateData = req.body;
    
    if (updateData.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    const addrIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
    if (addrIndex !== -1) {
      user.addresses[addrIndex] = { ...user.addresses[addrIndex].toObject(), ...updateData };
      user.markModified('addresses');
      await user.save({ validateModifiedOnly: true });
    }
    
    res.json(user.addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error updating address: ${err.message}` });
  }
});

module.exports = router;
