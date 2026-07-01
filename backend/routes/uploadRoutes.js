const express = require('express'); // trigger restart
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary is configured
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Allowed: jpg, png, jpeg, webp, svg'), false);
  }
};

const limits = {
  fileSize: 3 * 1024 * 1024, // Strict 3MB limit
};

let upload;

if (hasCloudinary) {
  // Use Cloudinary storage
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'vybe_designs',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
    },
  });

  upload = multer({ 
    storage: cloudStorage,
    fileFilter,
    limits
  });
} else {
  // Fallback: use local disk storage
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({ 
    storage: diskStorage,
    fileFilter,
    limits
  });
}

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Cloudinary gives req.file.path as the full URL
  // Local disk needs us to construct the URL
  const url = hasCloudinary 
    ? req.file.path 
    : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({ 
    message: 'File uploaded successfully',
    url
  });
});

module.exports = router;
