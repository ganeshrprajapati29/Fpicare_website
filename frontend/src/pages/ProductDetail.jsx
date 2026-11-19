import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiShoppingBag, FiZap, FiLock, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { FaLeaf, FaWhatsapp } from 'react-icons/fa';
import api, { errMsg, imgUrl } from '../api/client';
import ProductCard from '../components/ProductCard';
import { PageLoader, Stars, useTitle, Empty } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { inr, date } from '../utils/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [posting, setPosting] = useState(false);

  const load = () =>
    api
      .get(`/products/${slug}`)
      .then(({ data: d }) => setData(d))
      .catch((e) => setError(errMsg(e)));

  useEffect(() => {
    setData(null);
    setError('');
    setImg(0);
    setQty(1);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useTitle(data?.product?.name || 'Product');
  if (error) return <div className="container-x py-16"><Empty title="Product not found" text={error} action={<Link to="/shop" className="btn-primary">Back to shop</Link>} /></div>;
  if (!data) return <PageLoader />;

  const p = data.product;
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const images = p.images?.length ? p.images : ['/logo.png'];
  const wa = `https://wa.me/${(settings.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I want to order: ${p.name} (Qty ${qty})`)}`;

  const submitReview = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post(`/products/${p._id}/reviews`, review);
      toast.success('Thanks for your review!');
      setReview({ rating: 5, comment: '' });
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container-x py-8 sm:py-12">
      <nav className="mb-6 text-xs text-slate-500">
        <Link to="/" className="hover:text-rose-500">Home</Link> / <Link to="/shop" className="hover:text-rose-500">Shop</Link>
        {p.category && <> / <Link to={`/shop?category=${p.category.slug}`} className="hover:text-rose-500">{p.category.name}</Link></>}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="card relative overflow-hidden bg-gradient-to-br from-rose-50 to-navy-50">
            <img src={imgUrl(images[img])} alt={p.name} className="aspect-square w-full object-contain p-6" />
            {off > 0 && <span className="badge absolute left-4 top-4 bg-rose-500 px-3 py-1 text-sm text-white">{off}% OFF</span>}
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
              {images.map((src, k) => (
                <button key={src} onClick={() => setImg(k)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-rose-50 ${k === img ? 'border-rose-500' : 'border-transparent'}`}>
                  <img src={imgUrl(src)} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {p.brand && <p className="text-sm font-semibold uppercase tracking-wider text-rose-500">{p.brand}</p>}
          <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {p.numReviews > 0 && <span className="flex items-center gap-1"><Stars value={p.rating} /> {p.rating} ({p.numReviews} reviews)</span>}
            {p.packSize && <span className="badge bg-navy-50 text-navy-700">{p.packSize}</span>}
            {p.hormoneFree && <span className="badge bg-emerald-50 text-emerald-700"><FaLeaf /> Hormone-free</span>}
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-navy-900">{inr(p.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{inr(p.mrp)}</span>
                <span className="text-sm font-bold text-emerald-600">Save {inr(p.mrp - p.price)}</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500">Inclusive of all taxes</p>
          {p.shortDescription && <p className="mt-5 leading-relaxed text-slate-600">{p.shortDescription}</p>}
          {p.features?.length > 0 && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {f}</li>
              ))}
            </ul>
          )}

          <p className={`mt-6 text-sm font-semibold ${p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
            {p.stock > 10 ? 'In stock' : p.stock > 0 ? `Only ${p.stock} left — order soon` : 'Out of stock'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-slate-200 bg-white">
              <button className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><FiMinus /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button className="p-3" onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))} aria-label="Increase"><FiPlus /></button>
            </div>
            <button onClick={() => add(p, qty)} disabled={p.stock <= 0} className="btn-navy flex-1 py-3 sm:flex-none sm:px-8"><FiShoppingBag /> Add to Cart</button>
            <button
              onClick={() => {
                add(p, qty);
                nav('/checkout');
              }}
              disabled={p.stock <= 0}
              className="btn-primary flex-1 py-3 sm:flex-none sm:px-8"
            >
              <FiZap /> Buy Now
            </button>
          </div>
          <a href={wa} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline">
            <FaWhatsapp size={18} /> Order on WhatsApp
          </a>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [FiLock, 'Discreet pack'],
              [FiTruck, 'Fast delivery'],
              [FiShield, '100% genuine'],
              [FiRefreshCw, 'Easy returns*'],
            ].map(([Icon, t]) => (
              <div key={t} className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs font-medium text-navy-800">
                <Icon className="text-rose-500" size={18} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-slate-200">
          {[
            ['description', 'Description'],
            ['usage', 'How to use'],
            ['reviews', `Reviews (${p.numReviews})`],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === k ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-navy-800'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="py-8">
          {tab === 'description' && <p className="max-w-3xl whitespace-pre-line leading-relaxed text-slate-600">{p.description || p.shortDescription}</p>}
          {tab === 'usage' && (
            <div className="max-w-3xl space-y-4 text-slate-600">
              <p className="whitespace-pre-line leading-relaxed">{p.howToUse || 'Please read the instructions provided inside the pack before use.'}</p>
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Disclaimer: Information on this page is for general awareness only and is not medical advice. Please consult a qualified doctor before using any contraceptive medicine.
              </p>
            </div>
          )}
          {tab === 'reviews' && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-5">
                {p.reviews?.length ? (
                  p.reviews.map((r) => (
                    <div key={r._id} className="border-b border-slate-100 pb-5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-navy-900">{r.name}</p>
                        <span className="text-xs text-slate-400">{date(r.createdAt)}</span>
                      </div>
                      <Stars value={r.rating} />
                      {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No reviews yet. Be the first to review this product.</p>
                )}
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-bold">Write a review</h3>
                {user ? (
                  <form onSubmit={submitReview} className="mt-4 space-y-4">
                    <div>
                      <label className="label">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button type="button" key={n} onClick={() => setReview((r) => ({ ...r, rating: n }))} className={`h-10 w-10 rounded-full text-sm font-bold ${review.rating >= n ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Your review</label>
                      <textarea rows={4} className="input" value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} placeholder="Share your experience (optional)" />
                    </div>
                    <button disabled={posting} className="btn-primary">{posting ? 'Posting…' : 'Submit review'}</button>
                  </form>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Please <Link to={`/login?next=/product/${p.slug}`} className="font-semibold text-rose-600">login</Link> to write a review.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {data.related?.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-6 text-2xl font-extrabold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {data.related.map((r) => <ProductCard key={r._id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
