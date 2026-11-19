import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const dashboardStats = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [totalOrders, revenueAgg, totalProducts, totalUsers, newEnquiries, lowStock, statusAgg, daily, recentOrders, topProducts] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Enquiry.countDocuments({ status: 'new' }),
      Product.find({ stock: { $lte: 10 }, isActive: true }).select('name stock images slug').limit(8),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
      Product.find().sort({ sold: -1 }).limit(5).select('name sold price images'),
    ]);

  const days = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const hit = daily.find((x) => x._id === key);
    days.push({ date: key, revenue: hit?.revenue || 0, orders: hit?.orders || 0 });
  }

  res.json({
    totalOrders,
    revenue: revenueAgg[0]?.sum || 0,
    totalProducts,
    totalUsers,
    newEnquiries,
    lowStock,
    byStatus: Object.fromEntries(statusAgg.map((s) => [s._id, s.count])),
    daily: days,
    recentOrders,
    topProducts,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json(users);
});

export const updateUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw new ApiError(400, 'You cannot modify your own admin account here');
  const { isActive, role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (role && ['user', 'admin'].includes(role)) user.role = role;
  await user.save();
  res.json(user);
});

// ----- Enquiries -----
export const createEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, subject, message, type } = req.body;
  if (!name || !message || (!phone && !email)) throw new ApiError(400, 'Name, message and phone or email are required');
  const e = await Enquiry.create({ name, phone, email, subject, message, type });
  res.status(201).json({ message: 'Thank you! We will get back to you shortly.', id: e._id });
});
export const listEnquiries = asyncHandler(async (_req, res) => {
  res.json(await Enquiry.find().sort({ createdAt: -1 }).limit(500));
});
export const updateEnquiry = asyncHandler(async (req, res) => {
  const e = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!e) throw new ApiError(404, 'Enquiry not found');
  res.json(e);
});
export const deleteEnquiry = asyncHandler(async (req, res) => {
  await Enquiry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ----- Coupons -----
export const listCoupons = asyncHandler(async (_req, res) => res.json(await Coupon.find().sort({ createdAt: -1 })));
export const createCoupon = asyncHandler(async (req, res) => res.status(201).json(await Coupon.create(req.body)));
export const updateCoupon = asyncHandler(async (req, res) => {
  const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!c) throw new ApiError(404, 'Coupon not found');
  res.json(c);
});
export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
