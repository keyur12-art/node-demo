const Category = require('../collections/Category');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const DEFAULT_CATEGORIES = [
  { name: 'General', slug: 'general' },
  { name: 'Retail Store', slug: 'retail' },
  { name: 'Restaurant & Cafe', slug: 'restaurant' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Education', slug: 'education' },
  { name: 'Real Estate', slug: 'real_estate' },
  { name: 'Automotive', slug: 'automotive' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Fashion & Apparel', slug: 'fashion' },
  { name: 'Beauty & Spa', slug: 'beauty' },
  { name: 'Fitness & Gym', slug: 'fitness' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Manufacturing', slug: 'manufacturing' },
  { name: 'Logistics & Transport', slug: 'logistics' },
  { name: 'Consulting', slug: 'consulting' },
  { name: 'Other', slug: 'other' },
];

const ensureDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count > 0) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: '',
      isActive: true,
    }))
  );
};

const listCategories = async (req, res) => {
  try {
    await ensureDefaultCategories();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select('name slug description isActive createdAt');

    res.json({ success: true, message: 'Categories fetched', data: categories });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

const adminListCategories = async (req, res) => {
  try {
    await ensureDefaultCategories();

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .select('name slug description isActive createdAt updatedAt');

    res.json({ success: true, message: 'Categories fetched', data: categories });
  } catch (error) {
    console.error('Admin list categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

const adminCreateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters' });
    }

    const baseSlug = slugify(name);
    if (!baseSlug) {
      return res.status(400).json({ success: false, message: 'Invalid category name' });
    }

    let slug = baseSlug;
    let suffix = 2;
    while (await Category.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const category = await Category.create({
      name: String(name).trim(),
      slug,
      description: description ? String(description).trim() : '',
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

const adminUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name !== undefined) {
      const nextName = String(name).trim();
      if (nextName.length < 2) {
        return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters' });
      }
      category.name = nextName;
    }

    if (description !== undefined) {
      category.description = String(description || '').trim();
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

const adminDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.deleteOne({ _id: id });

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  listCategories,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  ensureDefaultCategories,
};
