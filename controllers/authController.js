const { generateToken } = require('../utilities/auth');
const User = require('../collections/User');
const Video = require('../collections/Video');
const Category = require('../collections/Category');
const { ensureDefaultCategories } = require('./categoryController');

const register = async (req, res) => {
  try {
    const { name, businessName, email, password, phone, address, businessDescription, category } = req.body;

    await ensureDefaultCategories();

    const requestedSlug = String(category || '').trim().toLowerCase();
    const slugCandidates = Array.from(
      new Set([requestedSlug, requestedSlug.replace(/_/g, '-'), requestedSlug.replace(/-/g, '_')])
    ).filter(Boolean);
    const categoryDoc = await Category.findOne({ slug: { $in: slugCandidates }, isActive: true }).select('slug');
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected',
        error: 'Invalid category selected',
      });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        error: 'User already exists',
      });
    }

    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : '';

    const user = new User({
      name,
      businessName: businessName || '',
      email: normalizedEmail,
      password,
      phone,
      address: address || '',
      businessDescription: businessDescription || '',
      category: categoryDoc.slug,
      logo: logoPath,
      role: 'user',
    });
    await user.save();

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        businessDescription: user.businessDescription,
        category: user.category,
        logo: user.logo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        error: 'User already exists',
      });
    }

    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
        error: 'Your account has been deactivated',
      });
    }

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        businessDescription: user.businessDescription,
        category: user.category,
        logo: user.logo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const adminData = {
      name: 'Admin User',
      email: 'admin@admin.com',
      password: 'admin123',
      phone: '1234567890',
      address: 'Admin Address',
      role: 'admin',
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists', error: 'Admin already exists' });
    }

    const admin = new User(adminData);
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      credentials: {
        email: 'admin@admin.com',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, message: 'Users retrieved successfully', data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');

    res.json({
      success: true,
      message: 'User stats retrieved successfully',
      data: {
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'User not found' });
    }

    await Video.deleteMany({ uploadedBy: user._id });
    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

module.exports = { register, login, createAdmin, getAllUsers, getUserStats, deleteUser };
