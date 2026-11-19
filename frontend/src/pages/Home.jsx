import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield, FiTruck, FiLock, FiHeadphones, FiArrowRight, FiCheckCircle, FiPackage, FiSmile, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { FaPills, FaBaby, FaTint, FaHeart, FaGift, FaShieldAlt, FaLeaf, FaHeartbeat, FaQuoteLeft } from 'react-icons/fa';
import api, { imgUrl } from '../api/client';
import ProductCard, { ProductSkeleton } from '../components/ProductCard';
import { SectionTitle, useTitle } from '../components/ui';
import { useSettings } from '../context/SettingsContext';

const CAT_ICONS = { shield: FaShieldAlt, pill: FaPills, baby: FaBaby, drop: FaTint, heart: FaHeart, gift: FaGift };
const CAT_COLORS = [
  'from-rose-500 to-pink-400',
  'from-navy-600 to-indigo-500',
  'from-fuchsia-500 to-rose-400',
  'from-sky-500 to-navy-500',
  'from-pink-500 to-fuchsia-500',
  'from-indigo-500 to-rose-500',
];

const FALLBACK_SLIDES = [
  {
    title: 'Family Planning, Made Simple & Private',
    subtitle: 'Trusted contraceptives and wellness essentials delivered in 100% discreet packaging.',
    image: '/images/products/saheli-plus.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
];

function Hero() {
  const { settings } = useSettings();
  const slides = settings.heroSlides?.length ? settings.heroSlides : FALLBACK_SLIDES;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[i % slides.length];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-navy-50">
      <div className="animate-blob absolute -left-32 -top-32 h-96 w-96 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="animate-blob absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-navy-200/50 blur-3xl [animation-delay:5s]" />
      <div className="container-x relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div key={i} className="animate-fadeUp text-center lg:text-left">
          <span className="badge bg-white px-3 py-1 text-rose-600 shadow-sm">
            <FaHeart /> Family Planning Items
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-[3.4rem]">
            {s.title?.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="text-gradient">{s.title?.split(' ').slice(-2).join(' ')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 sm:text-lg lg:mx-0">{s.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link to={s.ctaLink || '/shop'} className="btn-primary px-7 py-3 text-base">
              {s.ctaText || 'Shop Now'} <FiArrowRight />
            </Link>
            <Link to="/learn" className="btn-outline px-7 py-3 text-base">Learn More</Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 lg:justify-start">
            {['Discreet delivery', 'Cash on delivery', 'Genuine products'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> {t}</span>
            ))}
          </div>
          {slides.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              <button onClick={() => setI((x) => (x - 1 + slides.length) % slides.length)} className="rounded-full border border-slate-200 bg-white p-2 hover:border-rose-300" aria-label="Previous slide">
                <FiChevronLeft />
              </button>
              {slides.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? 'w-8 bg-rose-500' : 'w-2 bg-slate-300'}`} />
              ))}
              <button onClick={() => setI((x) => (x + 1) % slides.length)} className="rounded-full border border-slate-200 bg-white p-2 hover:border-rose-300" aria-label="Next slide">
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="absolute inset-6 rounded-full bg-brand opacity-25 blur-2xl" />
          <div className="animate-spin-slow absolute -inset-3 rounded-full border-2 border-dashed border-rose-300/60" />
          <div key={i} className="animate-fadeUp relative aspect-square rounded-full border-[10px] border-white bg-white shadow-[0_40px_80px_-30px_rgba(21,39,104,.45)]">
            <img src={imgUrl(s.image) || '/logo.png'} alt="" className="h-full w-full rounded-full object-contain p-6" />
          </div>
          <div className="absolute -left-2 top-10 hidden animate-floaty rounded-2xl bg-white px-4 py-3 shadow-xl sm:block">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-900"><FiLock className="text-rose-500" /> 100% Private</p>
          </div>
          <div className="absolute -right-2 bottom-12 hidden animate-floaty rounded-2xl bg-white px-4 py-3 shadow-xl [animation-delay:1.5s] sm:block">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-900"><FaLeaf className="text-emerald-500" /> Hormone-free options</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: FiLock, title: 'Discreet Packaging', text: 'Plain box, no product name outside' },
  { icon: FiTruck, title: 'Fast Delivery', text: 'Pan-India shipping in 2–6 days' },
  { icon: FiShield, title: '100% Genuine', text: 'Sourced from licensed distributors' },
  { icon: FiHeadphones, title: 'Expert Support', text: 'Talk to us on call or WhatsApp' },
];

const PILLARS = [
  { icon: FaShieldAlt, title: 'Safe Choices', text: 'Electronically tested condoms and quality-checked products you can rely on, every single time.', color: 'text-rose-500 bg-rose-50' },
  { icon: FaLeaf, title: 'Hormone-Free Options', text: 'Non-hormonal contraception like Saheli Plus (Centchroman) — a once-a-week pill developed in India.', color: 'text-navy-600 bg-navy-50' },
  { icon: FaHeartbeat, title: "Women's Wellness", text: 'Pregnancy tests, ovulation kits, intimate hygiene and menstrual care — all in one place.', color: 'text-fuchsia-600 bg-fuchsia-50' },
];

export default function Home() {
  useTitle('');
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [best, setBest] = useState(null);
  const [saheli, setSaheli] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCats(data)).catch(() => setCats([]));
    api.get('/products', { params: { featured: 1, limit: 8 } }).then(({ data }) => setFeatured(data.items)).catch(() => setFeatured([]));
    api.get('/products', { params: { bestseller: 1, limit: 4, sort: 'popular' } }).then(({ data }) => setBest(data.items)).catch(() => setBest([]));
    api.get('/reviews/latest').then(({ data }) => setReviews(data)).catch(() => {});
    api.get('/products', { params: { hormoneFree: 1, limit: 1 } }).then(({ data }) => setSaheli(data.items[0] || null)).catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      {/* Trust bar */}
      <section className="border-y border-slate-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <div key={title} data-reveal className="group flex items-center gap-3">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-500 transition duration-300 group-hover:-translate-y-1 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-glow"><Icon size={20} /></div>
              <div>
                <p className="text-sm font-semibold text-navy-900">{title}</p>
                <p className="hidden text-xs text-slate-500 sm:block">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Shop by category" title="Everything for Family Planning" subtitle="Thoughtfully curated essentials for couples, delivered with complete privacy." />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {cats.map((c, idx) => {
              const Icon = CAT_ICONS[c.icon] || FaHeart;
              return (
                <Link key={c._id} to={`/shop?category=${c.slug}`} data-reveal="zoom" style={{ transitionDelay: `${idx * 70}ms` }} className="group card card-hover flex flex-col items-center p-5 text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition duration-500 group-hover:rotate-6 group-hover:scale-110 ${CAT_COLORS[idx % CAT_COLORS.length]}`}>
                    <Icon size={26} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-navy-900">{c.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{c.productCount} products</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section bg-gradient-to-b from-white to-rose-50/50 pt-0">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle center={false} eyebrow="Handpicked for you" title="Featured Products" />
            <Link to="/shop" className="btn-outline mb-10">View all <FiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featured === null
              ? Array.from({ length: 8 }).map((_, k) => <ProductSkeleton key={k} />)
              : featured.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Why FPicare" title={<>Safe Choices. Healthier Tomorrows. <span className="text-gradient">Happier Families.</span></>} />
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, text, color }, k) => (
              <div key={title} data-reveal style={{ transitionDelay: `${k * 120}ms` }} className="group card card-hover relative overflow-hidden p-8">
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand transition duration-500 group-hover:scale-x-100" />
                <div className={`inline-flex rounded-2xl p-4 transition duration-500 group-hover:scale-110 ${color}`}><Icon size={28} /></div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight */}
      {saheli && (
        <section className="section pt-0">
          <div className="container-x">
            <div data-reveal="zoom" className="relative overflow-hidden rounded-[2rem] bg-navy-800 text-white shadow-[0_40px_80px_-30px_rgba(15,29,79,.6)]">
              <div className="animate-blob absolute -right-24 -top-24 h-80 w-80 rounded-full bg-rose-500/40 blur-3xl" />
              <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
                <div>
                  <span className="badge bg-emerald-400/20 text-emerald-200"><FaLeaf /> Hormone-free</span>
                  <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{saheli.name}</h2>
                  <p className="mt-4 text-navy-100">{saheli.shortDescription}</p>
                  <ul className="mt-6 space-y-2 text-sm text-navy-100">
                    {(saheli.features || []).slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2"><FiCheckCircle className="text-rose-300" /> {f}</li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={`/product/${saheli.slug}`} className="btn-primary px-7 py-3">Buy Now <FiArrowRight /></Link>
                    <Link to="/learn" className="btn border border-white/30 px-7 py-3 text-white hover:bg-white/10">How it works</Link>
                  </div>
                  <p className="mt-4 text-xs text-navy-200">Please consult your doctor before starting any contraceptive.</p>
                </div>
                <div data-reveal="right" className="rounded-3xl bg-white p-4 shadow-2xl transition duration-500 hover:rotate-1 hover:scale-[1.02]">
                  <img src={imgUrl(saheli.images?.[0])} alt={saheli.name} className="w-full rounded-2xl object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {best?.length > 0 && (
        <section className="section pt-0">
          <div className="container-x">
            <SectionTitle eyebrow="Customer favourites" title="Bestsellers" />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {best.map((p) => <ProductCard key={p._id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="section bg-gradient-to-br from-navy-50 via-white to-rose-50">
        <div className="container-x">
          <SectionTitle eyebrow="Simple & private" title="How Ordering Works" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: FiShield, t: 'Choose your products', d: 'Browse genuine family planning items with clear information.' },
              { icon: FiPackage, t: 'We pack it discreetly', d: 'Plain outer box. No product names or brand on the package.' },
              { icon: FiSmile, t: 'Delivered to your door', d: 'Pay online or cash on delivery. Track your order anytime.' },
            ].map(({ icon: Icon, t, d }, k) => (
              <div key={t} data-reveal style={{ transitionDelay: `${k * 150}ms` }} className="group relative card card-hover p-8 text-center">
                <span className="absolute right-5 top-4 text-5xl font-extrabold text-rose-100">0{k + 1}</span>
                <div className="mx-auto inline-flex rounded-full bg-brand p-4 text-white shadow-glow transition duration-500 group-hover:rotate-12 group-hover:scale-110"><Icon size={24} /></div>
                <h3 className="mt-5 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-sm text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials – real customer reviews */}
      {reviews.length > 0 && (
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Real stories" title="Loved by Couples" />
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.slice(0, 3).map((t) => (
              <figure key={t._id} data-reveal className="card card-hover p-7">
                <FaQuoteLeft className="text-2xl text-rose-200" />
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">{t.comment}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{t.name}</p>
                    <Link to={`/product/${t.slug}`} className="text-xs text-slate-500 hover:text-rose-600">{t.product}</Link>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="pb-16">
        <div className="container-x">
          <div data-reveal="zoom" className="relative overflow-hidden rounded-[2rem] bg-brand p-8 text-center text-white shadow-glow sm:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.25),transparent_40%)]" />
            <h2 className="relative text-2xl font-extrabold text-white sm:text-4xl">Bulk orders, clinics & distributors</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/90">Looking to stock FPicare products for your pharmacy, NGO or health camp? Get special wholesale pricing.</p>
            <Link to="/contact?type=bulk" className="btn relative mt-8 bg-white px-8 py-3 text-base text-navy-800 hover:bg-rose-50">Get a Quote <FiArrowRight /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
