import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, optionalAuth, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as auth from '../controllers/authController.js';
import * as cat from '../controllers/categoryController.js';
import * as prod from '../controllers/productController.js';
import * as order from '../controllers/orderController.js';
import * as admin from '../controllers/adminController.js';
import * as setting from '../controllers/settingController.js';

const r = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const formLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const isAdmin = [protect, adminOnly];

r.get('/health', (_req, res) => res.json({ ok: true, service: 'fpicare-api', time: new Date().toISOString() }));

// Auth
r.post('/auth/register', authLimiter, auth.register);
r.post('/auth/login', authLimiter, auth.login);
r.get('/auth/me', protect, auth.me);
r.put('/auth/me', protect, auth.updateProfile);
r.put('/auth/password', protect, auth.changePassword);

// Settings
r.get('/settings', setting.getSettings);
r.put('/settings', ...isAdmin, setting.updateSettings);

// Categories
r.get('/categories', optionalAuth, cat.listCategories);
r.post('/categories', ...isAdmin, cat.createCategory);
r.put('/categories/:id', ...isAdmin, cat.updateCategory);
r.delete('/categories/:id', ...isAdmin, cat.deleteCategory);

// Products
r.get('/reviews/latest', prod.latestReviews);
r.get('/products', optionalAuth, prod.listProducts);
r.get('/products/:idOrSlug', optionalAuth, prod.getProduct);
r.post('/products/:id/reviews', protect, prod.addReview);
r.post('/products', ...isAdmin, prod.createProduct);
r.put('/products/:id', ...isAdmin, prod.updateProduct);
r.delete('/products/:id', ...isAdmin, prod.deleteProduct);

// Orders
r.post('/orders/quote', optionalAuth, order.quote);
r.post('/orders', formLimiter, optionalAuth, order.createOrder);
r.get('/orders/my', protect, order.myOrders);
r.get('/orders/track', order.trackOrder);
r.get('/orders/admin', ...isAdmin, order.adminListOrders);
r.get('/orders/:id', protect, order.getOrder);
r.put('/orders/:id/cancel', protect, order.cancelMyOrder);
r.put('/orders/:id', ...isAdmin, order.adminUpdateOrder);

// Enquiries
r.post('/enquiries', formLimiter, admin.createEnquiry);
r.get('/enquiries', ...isAdmin, admin.listEnquiries);
r.put('/enquiries/:id', ...isAdmin, admin.updateEnquiry);
r.delete('/enquiries/:id', ...isAdmin, admin.deleteEnquiry);

// Coupons
r.post('/coupons/validate', order.quote);
r.get('/coupons', ...isAdmin, admin.listCoupons);
r.post('/coupons', ...isAdmin, admin.createCoupon);
r.put('/coupons/:id', ...isAdmin, admin.updateCoupon);
r.delete('/coupons/:id', ...isAdmin, admin.deleteCoupon);

// Admin
r.get('/admin/stats', ...isAdmin, admin.dashboardStats);
r.get('/admin/users', ...isAdmin, admin.listUsers);
r.put('/admin/users/:id', ...isAdmin, admin.updateUser);

// Uploads
r.post('/upload', ...isAdmin, upload.array('images', 8), (req, res) => {
  res.status(201).json({ urls: (req.files || []).map((f) => `/uploads/${f.filename}`) });
});

export default r;
