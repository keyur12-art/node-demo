const express = require('express');
const {
  getAllVideos,
  getUserVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideoStats,
  getVideosByCategory,
  getUserVideosByCategory,
  getUserCategories,
} = require('../../../controllers/videoController');
const { upload, uploadVideo } = require('../../../controllers/uploadController');
const authMiddleware = require('../../../middleware/authMiddleware');
const router = express.Router();

// Video routes
router.get('/videos', getAllVideos);
router.get('/videos/my', authMiddleware, getUserVideos);
router.get('/videos/stats', getVideoStats);
router.get('/videos/:id', getVideoById);
router.post('/videos/upload', authMiddleware, upload.single('video'), uploadVideo);
router.put('/videos/:id', authMiddleware, updateVideo);
router.delete('/videos/:id', authMiddleware, deleteVideo);

// Category-based routes (user-scoped)
router.get('/videos/user/categories', authMiddleware, getUserCategories);
router.get('/videos/category/:category', authMiddleware, getVideosByCategory);
router.get('/videos/user/by-category', authMiddleware, getUserVideosByCategory);

module.exports = router;
