// controllers/uploadController.js में uploadVideo function
const Video = require('../collections/Video');
const Category = require('../collections/Category');
const { videoUpload } = require('../middleware/upload');
const { ensureDefaultCategories } = require('./categoryController');

const slugCandidates = (value) => {
  const requested = String(value || '').trim().toLowerCase();
  return Array.from(new Set([requested, requested.replace(/_/g, '-'), requested.replace(/-/g, '_')])).filter(Boolean);
};

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video uploaded', error: 'No video uploaded' });
    }

    const { title, description, category, tags, websiteUrl, whatsappUrl } = req.body;

    await ensureDefaultCategories();

    const requestedCategory = category || 'general';
    const candidates = slugCandidates(requestedCategory);
    const categoryDoc = await Category.findOne({ slug: { $in: candidates }, isActive: true }).select('slug name');
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected',
        error: 'Invalid category selected',
      });
    }

    const video = new Video({
      title: title || req.file.originalname,
      description: description || '',
      category: categoryDoc.slug,
      tags: tags
        ? String(tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/videos/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
      websiteUrl: websiteUrl || '',
      whatsappUrl: whatsappUrl || '',
      status: 'active',
    });

    await video.save();

    const populatedVideo = await Video.findById(video._id).populate('uploadedBy', 'name businessName email logo');

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        ...populatedVideo.toObject(),
        categoryName: categoryDoc.name,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

module.exports = {
  upload: videoUpload,
  uploadVideo,
};
