# FPicare Website – Project Brief / Master Prompt

Use this brief to understand, extend or rebuild the project.

---

## 1. Business

- **Brand:** FPicare – *Family Planning Items*
- **Tagline:** *Care for Every Couple*
- **Brand pillars (from logo):** Safe Choices · Hormone-Free Options · Women's Wellness
  (also: Healthier Tomorrows · Happier Families)
- **Brand colours:** Navy blue `#1a3080` / `#0f1d4f`, Rose pink `#e5267a` / `#d01467`, pink → blue gradient
- **Fonts:** Poppins (UI) + Dancing Script (tagline)
- **Contact:** +91 97178 86422 (call & WhatsApp)
- **Reference sites:** moodsplanet.com (brand-site look), Flipkart product pages (product detail layout)
- **Hero product:** Saheli Plus – Centchroman Tablets I.P. (non-hormonal, weekly pill)
- **Audience:** Indian couples aged 18+. Privacy and discreet delivery are the top concerns.

## 2. Goal

A professional, fully responsive e-commerce website to sell family planning and intimate wellness products,
with a complete admin panel to manage the catalog, orders, customers and site content, deployed on the existing VPS
without disturbing other projects that already run there.

## 3. Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios, react-hot-toast, react-icons |
| Backend | Node.js 18+, Express 4, Mongoose 8, JWT, bcryptjs, multer, helmet, cors, compression, express-rate-limit |
| Database | MongoDB (database name `fpicare`) |
| Hosting | Ubuntu VPS · Nginx (static + reverse proxy) · PM2 · Let's Encrypt SSL |
| CI/CD | GitHub Actions → SCP + SSH → `deploy/deploy.sh` |

## 4. Website pages

1. **Home** – announcement bar, hero slider (managed from admin), trust bar, categories, featured products, brand pillars,
   Saheli Plus spotlight, bestsellers, "how ordering works", testimonials, bulk-order CTA
2. **Shop** – search, category / price / hormone-free filters, sort, pagination, mobile filter sheet
3. **Product detail** – gallery, price/MRP/discount, pack size, features, stock status, qty, Add to cart, Buy now,
   WhatsApp order, trust badges, tabs (Description / How to use + medical disclaimer / Reviews), related products
4. **Cart drawer + Cart page** – qty update, remove, free-shipping progress bar
5. **Checkout** – guest or logged-in, Indian address form with state list, 6-digit pincode, COD, coupon,
   discreet-packaging option, server-calculated totals
6. **Order success** and **Track order** (order no. + phone, status timeline, courier/tracking ID)
7. **Login / Register / My account** – order history with cancel, profile, default address, change password
8. **About, Contact (enquiry form: general/support/bulk/distributor), Learn & FAQ, Privacy, Terms, Shipping, Returns, 404**
9. **Global:** 18+ age gate, floating WhatsApp button, SEO meta, mobile drawer menu

## 5. Admin panel (`/admin`, role = admin)

Dashboard (KPIs, 14-day revenue chart, orders by status, recent orders, top sellers, low stock) · Orders (list, filter,
search, detail, status workflow, payment status, courier/tracking, call/WhatsApp, print) · Products (CRUD, multi-image
upload, toggles) · Categories · Coupons · Customers · Enquiries · Settings (contact info, announcement, shipping rules,
COD, socials, hero slides).

## 6. API (prefix `/api`)

| Area | Endpoints |
|---|---|
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/me`, `PUT /auth/password` |
| Settings | `GET /settings`, `PUT /settings` (admin) |
| Categories | `GET /categories`, `POST/PUT/DELETE /categories/:id` (admin) |
| Products | `GET /products?q&category&sort&page&limit&featured&bestseller&hormoneFree&minPrice&maxPrice`, `GET /products/:idOrSlug`, `POST /products/:id/reviews`, admin CRUD |
| Orders | `POST /orders/quote`, `POST /orders`, `GET /orders/my`, `GET /orders/track`, `GET /orders/:id`, `PUT /orders/:id/cancel`, admin `GET /orders/admin`, `PUT /orders/:id` |
| Coupons | `POST /coupons/validate`, admin CRUD |
| Enquiries | `POST /enquiries`, admin list/update/delete |
| Admin | `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id` |
| Upload | `POST /upload` (admin, field `images`, max 8 × 5 MB) |

**Business rules:** prices, discounts and shipping are always recalculated on the server; stock is reserved atomically
when an order is placed and restored on cancel; free shipping above the threshold set in Settings; order numbers look like `FPCyymmddNNNNN`.

## 7. Deployment rules (shared VPS)

- Own folder `/var/www/fpicare`, own PM2 app `fpicare-api`, API bound to `127.0.0.1` on the first free port from 5055
- Own Nginx file `fpicare.conf`; always `nginx -t` before `reload`; roll back on failure
- Never `pm2 delete all`, never restart or modify other sites/services
- Separate MongoDB database `fpicare`; install MongoDB only if none is running
- Default domain `fpicare.<ip-with-dashes>.sslip.io` with HTTPS; custom domain through the `DOMAIN` variable
- Secrets (server password, JWT secret, admin password) are never committed; the admin password is generated on the
  server and saved to `/root/fpicare-credentials.txt`

## 8. Next phase (optional)

- Online payments (Razorpay UPI/cards) + webhooks
- Order emails/SMS (Nodemailer / MSG91) and WhatsApp notifications
- Pincode serviceability + courier API (Shiprocket)
- Blog for SEO, sitemap.xml, Google Analytics / Meta Pixel
- Hindi language toggle
