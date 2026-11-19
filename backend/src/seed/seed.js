/* eslint-disable no-console */
// Usage: npm run seed            -> admin, settings and the full catalog; only adds what is missing
//        npm run seed -- --reset -> wipes catalog (categories/products/coupons) and re-seeds
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import slugify from '../utils/slugify.js';

const img = (f) => `/images/products/${f}`;

const categories = [
  { name: 'Condoms', icon: 'shield', description: 'Safe, reliable protection for every couple.', sortOrder: 1 },
  { name: 'Contraceptive Pills', icon: 'pill', description: 'Trusted oral contraceptive options, including hormone-free choices.', sortOrder: 2 },
  { name: 'Pregnancy & Fertility', icon: 'baby', description: 'Test kits to help you plan with confidence.', sortOrder: 3 },
  { name: 'Intimate Care', icon: 'drop', description: 'Gentle lubricants and hygiene essentials.', sortOrder: 4 },
  { name: "Women's Wellness", icon: 'heart', description: 'Everyday comfort and wellness for women.', sortOrder: 5 },
  { name: 'Combo Packs', icon: 'gift', description: 'Value bundles curated for couples.', sortOrder: 6 },
];

const products = (c) => [
  {
    name: 'Saheli Plus – Centchroman Tablets I.P.',
    brand: 'Saheli',
    category: c['Contraceptive Pills'],
    shortDescription: 'Non-hormonal, once-a-week oral contraceptive pill. Strip of 10 tablets.',
    description:
      'Saheli Plus contains Centchroman (Ormeloxifene), a non-steroidal, non-hormonal oral contraceptive developed in India. It is taken twice a week for the first three months and once a week thereafter. Please read the leaflet and consult your doctor before starting any contraceptive.',
    features: ['Non-hormonal & non-steroidal', 'Once-a-week dosage after 3 months', 'Developed in India', '10 tablets per strip'],
    howToUse: 'Take as advised by your doctor. Commonly: first tablet on day 1 of the period, then twice a week for 3 months, then once a week.',
    images: [img('saheli-plus.jpg')],
    price: 99,
    mrp: 120,
    stock: 250,
    packSize: '10 Tablets',
    hormoneFree: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['centchroman', 'weekly pill', 'hormone free', 'saheli'],
  },
  {
    name: 'Ultra Thin Condoms – 10 Pack',
    brand: 'FPicare',
    category: c.Condoms,
    shortDescription: 'Extra thin for a natural feel with dependable protection.',
    description: 'Electronically tested, extra-thin latex condoms lubricated for comfort. Designed for a natural feel without compromising on safety.',
    features: ['Electronically tested', 'Extra thin latex', 'Pre-lubricated', 'Discreet packaging'],
    howToUse: 'Check expiry, open carefully, and follow the instructions printed inside the pack. Use a new condom every time.',
    images: [img('ultra-thin.svg')],
    price: 149,
    mrp: 199,
    stock: 300,
    packSize: '10 Condoms',
    isFeatured: true,
    isBestSeller: true,
    tags: ['condom', 'ultra thin'],
  },
  {
    name: 'Dotted Condoms – 10 Pack',
    brand: 'FPicare',
    category: c.Condoms,
    shortDescription: 'Raised dots for extra sensation and reliable protection.',
    description: 'Dotted latex condoms with a textured surface, electronically tested for quality and safety.',
    features: ['Textured dotted surface', 'Electronically tested', 'Pre-lubricated'],
    images: [img('dotted.svg')],
    price: 159,
    mrp: 210,
    stock: 200,
    packSize: '10 Condoms',
    isFeatured: true,
    tags: ['condom', 'dotted'],
  },
  {
    name: 'Long Lasting Condoms – 10 Pack',
    brand: 'FPicare',
    category: c.Condoms,
    shortDescription: 'Climax-delay formula for longer-lasting intimacy.',
    description: 'Long lasting condoms with a mild benzocaine lubricant designed to help delay climax.',
    features: ['Climax-delay lubricant', 'Electronically tested', 'Comfort fit'],
    images: [img('long-lasting.svg')],
    price: 179,
    mrp: 240,
    stock: 180,
    packSize: '10 Condoms',
    isBestSeller: true,
    tags: ['condom', 'long lasting'],
  },
  {
    name: 'Strawberry Flavoured Condoms – 10 Pack',
    brand: 'FPicare',
    category: c.Condoms,
    shortDescription: 'Delightful strawberry flavour, dependable protection.',
    description: 'Flavoured latex condoms with a pleasant strawberry aroma. Electronically tested for safety.',
    features: ['Strawberry flavour', 'Electronically tested', 'Pre-lubricated'],
    images: [img('strawberry.svg')],
    price: 149,
    mrp: 199,
    stock: 150,
    packSize: '10 Condoms',
    tags: ['condom', 'flavoured'],
  },
  {
    name: 'Classic Condoms – 6 Pack',
    brand: 'FPicare',
    category: c.Condoms,
    shortDescription: 'Affordable protection — smooth, safe and easy to use.',
    description: 'Classic smooth latex condoms offering affordable, everyday protection.',
    features: ['Smooth & safe', 'Easy to use', 'Value pack'],
    images: [img('classic-6.svg')],
    price: 49,
    mrp: 60,
    stock: 500,
    packSize: '6 Condoms',
    isFeatured: true,
    tags: ['condom', 'affordable'],
  },
  {
    name: 'Pregnancy Test Kit',
    brand: 'FPicare',
    category: c['Pregnancy & Fertility'],
    shortDescription: 'Fast, accurate results at home in 5 minutes.',
    description: 'Easy-to-use hCG pregnancy test card with dropper. Clear results within 5 minutes.',
    features: ['Results in 5 minutes', '99% accurate (as per lab tests)', 'Easy to read'],
    howToUse: 'Use first morning urine. Add 3–4 drops to the sample well and read the result after 5 minutes.',
    images: [img('pregnancy-test.svg')],
    price: 49,
    mrp: 70,
    stock: 400,
    packSize: '1 Kit',
    isBestSeller: true,
    tags: ['pregnancy test', 'hcg'],
  },
  {
    name: 'Ovulation Test Strips – Pack of 5',
    brand: 'FPicare',
    category: c['Pregnancy & Fertility'],
    shortDescription: 'Identify your most fertile days to plan better.',
    description: 'LH ovulation test strips that help identify your most fertile window.',
    features: ['Detects LH surge', 'Easy dip strips', '5 strips per pack'],
    images: [img('ovulation-kit.svg')],
    price: 299,
    mrp: 399,
    stock: 120,
    packSize: '5 Strips',
    tags: ['ovulation', 'fertility'],
  },
  {
    name: 'Aqua Gel Water-Based Lubricant 50ml',
    brand: 'FPicare',
    category: c['Intimate Care'],
    shortDescription: 'Gentle, non-sticky and condom-compatible.',
    description: 'Water-based personal lubricant that is gentle on skin, non-sticky and safe to use with latex condoms.',
    features: ['Water based', 'Condom compatible', 'Non-sticky, easy to wash'],
    images: [img('lubricant.svg')],
    price: 199,
    mrp: 275,
    stock: 160,
    packSize: '50 ml',
    isFeatured: true,
    tags: ['lubricant', 'gel'],
  },
  {
    name: 'Intimate Wash for Women 100ml',
    brand: 'FPicare',
    category: c["Women's Wellness"],
    shortDescription: 'pH-balanced daily hygiene wash.',
    description: 'A mild, pH-balanced intimate wash enriched with natural extracts for everyday freshness.',
    features: ['pH balanced', 'Soap free', 'Dermatologically tested'],
    images: [img('intimate-wash.svg')],
    price: 179,
    mrp: 249,
    stock: 140,
    packSize: '100 ml',
    tags: ['intimate wash', 'hygiene'],
  },
  {
    name: 'Comfort Menstrual Cup – Medium',
    brand: 'FPicare',
    category: c["Women's Wellness"],
    shortDescription: 'Reusable medical-grade silicone cup for up to 12 hours of comfort.',
    description: 'Soft, reusable medical-grade silicone menstrual cup. Eco-friendly and comfortable for up to 12 hours.',
    features: ['Medical-grade silicone', 'Reusable for years', 'Up to 12 hours protection'],
    images: [img('menstrual-cup.svg')],
    price: 299,
    mrp: 449,
    stock: 90,
    packSize: 'Medium',
    tags: ['menstrual cup', 'period care'],
  },
  {
    name: 'Couple Care Combo Kit',
    brand: 'FPicare',
    category: c['Combo Packs'],
    shortDescription: 'Ultra Thin Condoms (10) + Aqua Gel Lubricant (50ml).',
    description: 'A thoughtfully curated combo for couples: one pack of Ultra Thin condoms and one Aqua Gel lubricant at a special price.',
    features: ['Best value bundle', 'Discreet packaging', 'Perfect gift for couples'],
    images: [img('couple-combo.svg')],
    price: 299,
    mrp: 474,
    stock: 80,
    packSize: 'Combo',
    isFeatured: true,
    tags: ['combo', 'couple'],
  },
];

const heroSlides = [
  {
    title: 'Family Planning, Made Simple & Private',
    subtitle: 'Trusted contraceptives and wellness essentials delivered in 100% discreet packaging.',
    image: '/images/products/saheli-plus.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    title: 'Hormone-Free Options for Her',
    subtitle: 'Saheli Plus — the once-a-week, non-hormonal pill developed in India.',
    image: '/images/products/saheli-plus.jpg',
    ctaText: 'Explore Pills',
    ctaLink: '/shop?category=contraceptive-pills',
  },
  {
    title: 'Safe Choices. Happier Families.',
    subtitle: 'Premium condoms, test kits and intimate care at honest prices.',
    image: '/logo.png',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
];

async function run() {
  await connectDB();
  const reset = process.argv.includes('--reset');

  // Admin (created once; password is never overwritten on re-runs)
  const email = (process.env.ADMIN_EMAIL || 'admin@fpicare.in').toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || 'FPicare Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }

  const settings = await Setting.getSite();
  if (!settings.heroSlides?.length) {
    settings.heroSlides = heroSlides;
    await settings.save();
  }

  if (reset) {
    await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Coupon.deleteMany({})]);
    console.log('Catalog cleared');
  }

  // Upsert-missing: adds any category/product/coupon that does not exist yet (matched by slug/code).
  // Existing records are never overwritten, so edits made in the admin panel are safe on redeploy.
  let newCats = 0;
  for (const c of categories) {
    const slug = slugify(c.name);
    // eslint-disable-next-line no-await-in-loop
    const r = await Category.updateOne({ slug }, { $setOnInsert: { ...c, slug } }, { upsert: true });
    newCats += r.upsertedCount;
  }
  const cats = await Category.find({ slug: { $in: categories.map((c) => slugify(c.name)) } });
  const map = Object.fromEntries(cats.map((c) => [c.name, c._id]));

  let newProducts = 0;
  const list = products(map);
  for (let i = 0; i < list.length; i += 1) {
    const p = list[i];
    const slug = slugify(p.name);
    // eslint-disable-next-line no-await-in-loop
    const r = await Product.updateOne(
      { slug },
      { $setOnInsert: { ...p, slug, sku: `FPC-${String(i + 1).padStart(4, '0')}` } },
      { upsert: true }
    );
    newProducts += r.upsertedCount;
  }

  const coupons = [
    { code: 'WELCOME10', description: '10% off on your first order', type: 'percent', value: 10, maxDiscount: 100 },
    { code: 'CARE50', description: '₹50 off on orders above ₹399', type: 'flat', value: 50, minOrder: 399 },
  ];
  for (const c of coupons) {
    // eslint-disable-next-line no-await-in-loop
    await Coupon.updateOne({ code: c.code }, { $setOnInsert: c }, { upsert: true });
  }
  console.log(`Seed done: +${newCats} categories, +${newProducts} products (existing ones untouched)`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
