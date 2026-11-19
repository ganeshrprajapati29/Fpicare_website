import mongoose from 'mongoose';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const genOrderNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `FPC${ymd}${Math.floor(10000 + Math.random() * 90000)}`;
};

// Recomputes totals on the server — client prices are never trusted.
async function buildQuote(items = [], couponCode) {
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, 'Cart is empty');
  const ids = items.map((i) => i.product);
  if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, 'Invalid product in cart');
  const products = await Product.find({ _id: { $in: ids }, isActive: true });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const lines = items.map((i) => {
    const p = map.get(String(i.product));
    if (!p) throw new ApiError(400, 'A product in your cart is no longer available');
    const qty = Math.max(1, parseInt(i.qty, 10) || 1);
    if (p.stock < qty) throw new ApiError(400, `Only ${p.stock} left in stock for ${p.name}`);
    return { product: p._id, name: p.name, image: p.images?.[0], price: p.price, qty };
  });

  const settings = await Setting.getSite();
  const itemsTotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  let discount = 0;
  let appliedCoupon;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    if (!coupon) throw new ApiError(400, 'Invalid coupon code');
    try {
      discount = coupon.computeDiscount(itemsTotal);
    } catch (e) {
      throw new ApiError(400, e.message);
    }
    appliedCoupon = coupon.code;
  }
  const shippingFee = itemsTotal - discount >= settings.freeShippingAbove ? 0 : settings.shippingFee;
  return { lines, itemsTotal, discount, shippingFee, total: itemsTotal - discount + shippingFee, couponCode: appliedCoupon, settings };
}

export const quote = asyncHandler(async (req, res) => {
  const { lines, itemsTotal, discount, shippingFee, total, couponCode } = await buildQuote(req.body.items, req.body.couponCode);
  res.json({ items: lines, itemsTotal, discount, shippingFee, total, couponCode });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'COD', couponCode, notes, discreetPackaging = true } = req.body;
  const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
  const missing = required.filter((k) => !shippingAddress?.[k]);
  if (missing.length) throw new ApiError(400, `Missing address fields: ${missing.join(', ')}`);
  if (!/^\d{6}$/.test(String(shippingAddress.pincode))) throw new ApiError(400, 'Pincode must be 6 digits');
  if (!/^[6-9]\d{9}$/.test(String(shippingAddress.phone).replace(/\D/g, '').slice(-10))) {
    throw new ApiError(400, 'Enter a valid 10-digit mobile number');
  }

  const q = await buildQuote(items, couponCode);
  if (paymentMethod === 'COD' && !q.settings.codEnabled) throw new ApiError(400, 'Cash on delivery is not available right now');

  // Reserve stock atomically per line; roll back on failure.
  const reserved = [];
  try {
    for (const l of q.lines) {
      // eslint-disable-next-line no-await-in-loop
      const r = await Product.updateOne({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty, sold: l.qty } });
      if (!r.modifiedCount) throw new ApiError(400, `${l.name} just went out of stock`);
      reserved.push(l);
    }
  } catch (e) {
    await Promise.all(reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty, sold: -l.qty } })));
    throw e;
  }

  const order = await Order.create({
    orderNumber: genOrderNumber(),
    user: req.user?._id,
    items: q.lines,
    shippingAddress,
    paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
    itemsTotal: q.itemsTotal,
    discount: q.discount,
    couponCode: q.couponCode,
    shippingFee: q.shippingFee,
    total: q.total,
    notes,
    discreetPackaging,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });
  res.status(201).json(order);
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) throw new ApiError(400, 'Order number and phone are required');
  const order = await Order.findOne({ orderNumber: String(orderNumber).trim().toUpperCase() });
  const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);
  if (!order || last10(order.shippingAddress.phone) !== last10(phone)) throw new ApiError(404, 'No order found with these details');
  res.json(order);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw new ApiError(404, 'Order not found');
  const isOwner = order.user && String(order.user._id) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not allowed');
  res.json(order);
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(400, 'This order can no longer be cancelled');
  await restock(order);
  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();
  res.json(order);
});

async function restock(order) {
  await Promise.all(order.items.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty, sold: -l.qty } })));
}

// ---------- Admin ----------
export const adminListOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ orderNumber: rx }, { 'shippingAddress.fullName': rx }, { 'shippingAddress.phone': rx }];
  }
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const adminUpdateOrder = asyncHandler(async (req, res) => {
  const { status, note, paymentStatus, trackingId, courier } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (status && status !== order.status) {
    if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status');
    if (order.status === 'cancelled') throw new ApiError(400, 'Cancelled orders cannot be changed');
    if (status === 'cancelled') await restock(order);
    order.status = status;
    order.statusHistory.push({ status, note });
    if (status === 'delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'paid';
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingId !== undefined) order.trackingId = trackingId;
  if (courier !== undefined) order.courier = courier;
  await order.save();
  res.json(order);
});
