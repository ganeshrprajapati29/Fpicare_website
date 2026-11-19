# FPicare – Family Planning Items 🩷💙

> **Care for Every Couple** — a full-stack e-commerce website with an admin panel for FPicare.

**Stack:** React 18 + Vite + Tailwind CSS · Node.js + Express · MongoDB (Mongoose) · JWT auth · PM2 · Nginx

---

## ✨ Features

**Website (fully responsive)**
- Home page with hero slider, categories, featured products, Saheli Plus spotlight, bestsellers, testimonials and a bulk-order call to action
- Shop with search, category, price, hormone-free filters, sorting and pagination
- Product page with gallery, offers, features, how to use, reviews and WhatsApp ordering
- Cart drawer, cart page, coupon codes and server-verified checkout (Cash on Delivery)
- Guest checkout, order tracking by order number and mobile number
- Customer accounts: register/login, order history, cancel order, profile, address, change password
- About, Contact (enquiry form), Learn/FAQ and policy pages
- 18+ age confirmation, floating WhatsApp button, discreet-packaging messaging, SEO meta tags

**Admin panel (`/admin`)**
- Dashboard: revenue, orders, products, customers, 14-day revenue chart, status breakdown, low stock, top sellers
- Products: create, edit, delete, image upload, featured/bestseller/active toggles, stock & MRP
- Categories, Coupons (percent/flat, minimum order, cap, expiry)
- Orders: filter/search, status workflow (stock restored on cancel), courier & tracking ID, call/WhatsApp customer, print
- Customers (activate/deactivate, make admin), Enquiries inbox
- Store settings: phone, WhatsApp, email, address, announcement bar, shipping fee, free-shipping threshold, COD, social links, homepage hero slides

---

## 📁 Project structure

```
fpicare_website/
├── backend/                 Express + MongoDB API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/     auth, product, category, order, admin, settings
│   │   ├── middleware/      auth (JWT), error handler, upload (multer)
│   │   ├── models/          User, Product, Category, Order, Coupon, Enquiry, Setting
│   │   ├── routes/index.js  all /api routes
│   │   ├── seed/seed.js     admin + sample catalog
│   │   ├── app.js
│   │   └── server.js
│   └── uploads/             uploaded images (git-ignored)
├── frontend/                React + Vite + Tailwind
│   ├── public/              logo, favicon, product images
│   └── src/
│       ├── api/             axios client
│       ├── context/         Auth, Cart, Settings
│       ├── components/      layout (Header, Footer, CartDrawer…), ProductCard, ui
│       ├── pages/           Home, Shop, ProductDetail, Cart, Checkout, Account, …
│       └── admin/           AdminLayout + admin pages
├── deploy/deploy.sh         safe one-command VPS deploy
├── .github/workflows/       CI build + deploy to VPS
└── docs/PROJECT_PROMPT.md   full project brief / spec
```

---

## 🚀 Run locally

Requirements: Node 18+ and MongoDB (local or Atlas).

```bash
# 1. API
cd backend
cp .env.example .env        # edit MONGO_URI / JWT_SECRET
npm install
npm run seed                # creates admin + sample products
npm run dev                 # http://127.0.0.1:5055

# 2. Website (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5055)
```

Default admin from `.env.example`: `admin@fpicare.in` / `Admin@12345`. **Change it in production.**

---

## 🌐 Deploy to the VPS

The deploy script is **safe for a VPS that already runs other projects**:

| Resource | What FPicare uses | Effect on other projects |
|---|---|---|
| Folder | `/var/www/fpicare` | none |
| API process | PM2 app `fpicare-api` on `127.0.0.1:<first free port from 5055>` | other PM2 apps are never touched |
| Web server | Nginx site file `fpicare.conf` (validated with `nginx -t`, then a graceful reload) | other sites keep running; the file is rolled back if validation fails |
| Database | MongoDB database `fpicare` (installs MongoDB only if none is running) | other databases are never touched |
| Node.js | existing Node ≥18, or a private copy in `/opt/fpicare-node` | system Node is not changed |
| Domain | `fpicare.<server-ip-with-dashes>.sslip.io` by default (free, no DNS setup) + free HTTPS certificate | — |

### Option A – Manual (SSH)

```bash
ssh root@YOUR_SERVER_IP
git clone https://github.com/ganeshrprajapati29/fpicare_website.git /tmp/fpicare-src
bash /tmp/fpicare-src/deploy/deploy.sh /tmp/fpicare-src
cat /root/fpicare-credentials.txt      # admin login generated on first deploy
```

Use your own domain: `DOMAIN=fpicare.in bash /tmp/fpicare-src/deploy/deploy.sh /tmp/fpicare-src`
(point the domain's A record to the server first).

### Option B – Automatic (GitHub Actions)

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `VPS_HOST` = server IP
   - `VPS_USER` = `root`
   - `VPS_PASSWORD` = server password (or `VPS_SSH_KEY` = private key, recommended)
2. Same page → **Variables** tab → add `AUTO_DEPLOY` = `true` (and optionally `DOMAIN`).
3. Every push to `main` now builds and deploys. You can also run it manually from **Actions → Deploy to VPS → Run workflow**.

### Useful commands on the server

```bash
pm2 status fpicare-api
pm2 logs fpicare-api
pm2 restart fpicare-api
nano /var/www/fpicare/backend/.env     # then: pm2 restart fpicare-api --update-env
```
