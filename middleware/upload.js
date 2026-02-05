const fs = require('fs');
const multer = require('multer');
const path = require('path');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer for logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/logos';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed'), false),
});

// Multer for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/videos';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];
    allowedMimes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file type. Only video files are allowed.'), false);
  },
});

module.exports = {
  logoUpload,
  videoUpload,
};
