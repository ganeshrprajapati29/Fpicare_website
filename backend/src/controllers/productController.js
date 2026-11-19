import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  popular: { sold: -1, rating: -1 },
  rating: { rating: -1 },
};

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, sort = 'newest', featured, bestseller, minPrice, maxPrice, hormoneFree } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const isAdminAll = req.query.all === '1' && req.user?.role === 'admin';

  const filter = isAdminAll ? {} : { isActive: true };
  if (q) {
    const rx = new RegExp(escapeRegex(String(q)), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { tags: rx }, { shortDescription: rx }];
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    filter.category = cat ? cat._id : null;
  }
  if (featured === '1') filter.isFeatured = true;
  if (bestseller === '1') filter.isBestSeller = true;
  if (hormoneFree === '1') filter.hormoneFree = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews -description')
      .populate('category', 'name slug')
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = /^[a-f\d]{24}$/i.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  const product = await Product.findOne(query).populate('category', 'name slug');
  if (!product || (!product.isActive && req.user?.role !== 'admin')) throw new ApiError(404, 'Product not found');

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category?._id,
    isActive: true,
  })
    .select('-reviews -description')
    .limit(4);

  res.json({ product, related });
});

const normalize = (body) => {
  const data = { ...body };
  ['features', 'tags', 'images'].forEach((k) => {
    if (typeof data[k] === 'string') data[k] = data[k].split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  });
  if (data.category === '') data.category = null;
  delete data.reviews;
  delete data.rating;
  delete data.numReviews;
  return data;
};

const uniqueSlug = async (base, excludeId) => {
  let slug = slugify(base) || 'product';
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
};

export const createProduct = asyncHandler(async (req, res) => {
  const data = normalize(req.body);
  if (!data.name || data.price === undefined) throw new ApiError(400, 'Name and price are required');
  data.slug = await uniqueSlug(data.slug || data.name);
  const product = await Product.create(data);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const data = normalize(req.body);
  if (data.slug) data.slug = await uniqueSlug(data.slug, req.params.id);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const r = Number(rating);
  if (!r || r < 1 || r > 5) throw new ApiError(400, 'Rating must be between 1 and 5');
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.reviews.some((rv) => String(rv.user) === String(req.user._id))) {
    throw new ApiError(400, 'You have already reviewed this product');
  }
  product.reviews.push({ user: req.user._id, name: req.user.name, rating: r, comment });
  product.numReviews = product.reviews.length;
  product.rating = Number((product.reviews.reduce((a, b) => a + b.rating, 0) / product.numReviews).toFixed(1));
  await product.save();
  res.status(201).json({ message: 'Review added', rating: product.rating, numReviews: product.numReviews });
});

// Latest good reviews across products (used for homepage testimonials).
export const latestReviews = asyncHandler(async (_req, res) => {
  const rows = await Product.aggregate([
    { $match: { isActive: true, 'reviews.0': { $exists: true } } },
    { $unwind: '$reviews' },
    { $match: { 'reviews.rating': { $gte: 4 }, 'reviews.comment': { $nin: [null, ''] } } },
    { $sort: { 'reviews.createdAt': -1 } },
    { $limit: 6 },
    { $project: { _id: '$reviews._id', name: '$reviews.name', rating: '$reviews.rating', comment: '$reviews.comment', product: '$name', slug: '$slug' } },
  ]);
  res.json(rows);
});
