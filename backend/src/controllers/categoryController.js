import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';

export const listCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === '1' && req.user?.role === 'admin' ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json(categories.map((c) => ({ ...c, productCount: map[String(c._id)] || 0 })));
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.name) throw new ApiError(400, 'Name is required');
  data.slug = slugify(data.slug || data.name);
  const cat = await Category.create(data);
  res.status(201).json(cat);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.slug || data.name) data.slug = slugify(data.slug || data.name);
  const cat = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!cat) throw new ApiError(404, 'Category not found');
  res.json(cat);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse) throw new ApiError(400, `Category has ${inUse} product(s). Move or delete them first.`);
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw new ApiError(404, 'Category not found');
  res.json({ message: 'Category deleted' });
});
