const Video = require('../collections/Video');
const Category = require('../collections/Category');
const { ensureDefaultCategories } = require('./categoryController');

const slugCandidates = (value) => {
  const requested = String(value || '').trim().toLowerCase();
  return Array.from(new Set([requested, requested.replace(/_/g, '-'), requested.replace(/-/g, '_')])).filter(Boolean);
};

const canAccessVideo = (user, video) => user?.role === 'admin' || String(video.uploadedBy) === String(user?._id);

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name businessName email logo');

    res.json({ success: true, message: 'Videos fetched', data: videos });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos', error: error.message });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name businessName email logo');

    res.json({ success: true, message: 'Videos fetched', data: videos });
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos', error: error.message });
  }
};

const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploadedBy', 'name businessName email logo');
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found', error: 'Video not found' });
    }

    res.json({ success: true, message: 'Video fetched', data: video });
  } catch (error) {
    console.error('Get video by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch video', error: error.message });
  }
};

const getVideoStats = async (req, res) => {
  try {
    const [totalVideos, activeVideos, pendingVideos, rejectedVideos, inactiveVideos] = await Promise.all([
      Video.countDocuments(),
      Video.countDocuments({ status: 'active' }),
      Video.countDocuments({ status: 'pending' }),
      Video.countDocuments({ status: 'rejected' }),
      Video.countDocuments({ status: 'inactive' }),
    ]);

    res.json({
      success: true,
      message: 'Video stats fetched',
      data: {
        totalVideos,
        activeVideos,
        pendingVideos,
        rejectedVideos,
        inactiveVideos,
      },
    });
  } catch (error) {
    console.error('Get video stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch video stats', error: error.message });
  }
};

const getUserCategories = async (req, res) => {
  try {
    const categories = await Video.distinct('category', { uploadedBy: req.user._id });
    const cleaned = categories.filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));

    res.json({ success: true, message: 'User categories fetched', data: cleaned });
  } catch (error) {
    console.error('Get user categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

const getVideosByCategory = async (req, res) => {
  try {
    const candidates = slugCandidates(req.params.category);
    const videos = await Video.find({
      uploadedBy: req.user._id,
      category: { $in: candidates },
    })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name businessName email logo');

    res.json({ success: true, message: 'Videos fetched', data: videos });
  } catch (error) {
    console.error('Get videos by category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos', error: error.message });
  }
};

const getUserVideosByCategory = async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('title description category path size mimetype createdAt status websiteUrl whatsappUrl');

    const grouped = videos.reduce((acc, video) => {
      const key = video.category || 'uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(video);
      return acc;
    }, {});

    res.json({ success: true, message: 'Videos grouped by category', data: grouped });
  } catch (error) {
    console.error('Get user videos by category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos', error: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found', error: 'Video not found' });
    }

    if (!canAccessVideo(req.user, video)) {
      return res.status(403).json({ success: false, message: 'Access denied', error: 'Access denied' });
    }

    const { title, description, category, tags, websiteUrl, whatsappUrl, status } = req.body;

    if (title !== undefined) video.title = String(title);
    if (description !== undefined) video.description = String(description);
    if (websiteUrl !== undefined) video.websiteUrl = String(websiteUrl);
    if (whatsappUrl !== undefined) video.whatsappUrl = String(whatsappUrl);
    if (status !== undefined) video.status = String(status);

    if (tags !== undefined) {
      video.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : String(tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }

    if (category !== undefined) {
      await ensureDefaultCategories();
      const candidates = slugCandidates(category);
      const categoryDoc = await Category.findOne({ slug: { $in: candidates }, isActive: true }).select('slug');
      if (!categoryDoc) {
        return res.status(400).json({ success: false, message: 'Invalid category selected', error: 'Invalid category selected' });
      }
      video.category = categoryDoc.slug;
    }

    await video.save();

    const populated = await Video.findById(video._id).populate('uploadedBy', 'name businessName email logo');
    res.json({ success: true, message: 'Video updated', data: populated });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ success: false, message: 'Failed to update video', error: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found', error: 'Video not found' });
    }

    if (!canAccessVideo(req.user, video)) {
      return res.status(403).json({ success: false, message: 'Access denied', error: 'Access denied' });
    }

    await Video.deleteOne({ _id: video._id });

    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete video', error: error.message });
  }
};

module.exports = {
  getAllVideos,
  getUserVideos,
  getVideoById,
  getVideoStats,
  updateVideo,
  deleteVideo,
  getUserCategories,
  getVideosByCategory,
  getUserVideosByCategory,
};
