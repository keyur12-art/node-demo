const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const connectDB = require('./db/connection');
const apiV1Router = require('./api/v1/web');  
const { ensureDefaultCategories } = require('./controllers/categoryController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/v1', apiV1Router);
  

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API running',
    version: 'v1',
    health: '/api/v1/health',
  });
});

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large', error: 'File too large' });
    }
    return res.status(400).json({ success: false, message: err.message, error: err.message });
  }

  if (err && typeof err.message === 'string') {
    const msg = err.message;
    if (
      msg.includes('Only image files are allowed') ||
      msg.includes('Only images allowed') ||
      msg.includes('Only video files allowed') ||
      msg.includes('Invalid file type')
    ) {
      return res.status(400).json({ success: false, message: msg, error: msg });
    }
  }

  console.error(err.stack || err);
  res.status(500).json({ success: false, message: 'Server error', error: err?.message || 'Server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
  console.log(`🚀 Server on ${PORT}`);
  console.log(`📁 Uploads: ${path.join(__dirname, 'uploads')}`);
  console.log('📋 Endpoints:');
   console.log('POST /api/v1/auth/register', apiV1Router );
  console.log('POST /api/v1/auth/register');
  console.log('POST /api/v1/auth/login');
  console.log('GET  /api/v1/auth/users');
  console.log('POST /api/v1/videos/upload');
  console.log('GET  /api/v1/videos/my');
});
};
 console.log("ENV CHECK:", {
  MONGO_URI: process.env.MONGO_URI ? "FOUND" : "MISSING",
  PORT: process.env.PORT,
});

start();
