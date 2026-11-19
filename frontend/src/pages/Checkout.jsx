import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLock, FiTag, FiTruck, FiCheck } from 'react-icons/fi';
import api, { errMsg, imgUrl } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { inr, INDIAN_STATES } from '../utils/format';
import { Empty, PageHero, Spinner, useTitle } from '../components/ui';

const blank = { fullName: '', phone: '', email: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  useTitle('Checkout');
  const { items, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [addr, setAddr] = useState(blank);
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');
  const [discreet, setDiscreet] = useState(true);

  useEffect(() => {
    if (!user) return;
    const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    setAddr((a) => ({ ...a, fullName: a.fullName || user.name, email: a.email || user.email, phone: a.phone || user.phone || '', ...(def ? { line1: def.line1, line2: def.line2, city: def.city, state: def.state, pincode: def.pincode } : {}) }));
  }, [user]);

  const payloadItems = items.map((i) => ({ product: i._id, qty: i.qty }));

  const fetchQuote = async (code = applied) => {
    if (!items.length) return;
    setQuoting(true);
    try {
      const { data } = await api.post('/orders/quote', { items: payloadItems, couponCode: code || undefined });
      setQuote(data);
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setQuoting(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const ok = await fetchQuote(coupon.trim());
    if (ok) {
      setApplied(coupon.trim().toUpperCase());
      toast.success('Coupon applied');
    }
  };
  const removeCoupon = () => {
    setApplied('');
    setCoupon('');
    fetchQuote('');
  };

  const set = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  const place = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        items: payloadItems,
        shippingAddress: addr,
        paymentMethod: 'COD',
        couponCode: applied || undefined,
        notes,
        discreetPackaging: discreet,
      });
      clear();
      nav(`/order-success/${data.orderNumber}`, { state: { order: data } });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <div className="container-x py-16">
        <Empty title="Nothing to checkout" text="Your cart is empty." action={<Link to="/shop" className="btn-primary">Shop now</Link>} />
      </div>
    );
  }

  return (
    <>
      <PageHero crumb="Checkout" title="Secure Checkout" subtitle="Your order ships in plain, unbranded packaging." />
      <form onSubmit={place} className="container-x grid gap-8 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!user && (
            <div className="rounded-2xl bg-navy-50 p-4 text-sm text-navy-800">
              Have an account? <Link to="/login?next=/checkout" className="font-semibold text-rose-600">Login</Link> for faster checkout and order history. Or continue as guest.
            </div>
          )}
          <div className="card p-6">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold"><FiTruck className="text-rose-500" /> Delivery Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full name *</label><input required className="input" value={addr.fullName} onChange={set('fullName')} /></div>
              <div><label className="label">Mobile number *</label><input required inputMode="numeric" pattern="[0-9+ ]{10,14}" className="input" value={addr.phone} onChange={set('phone')} placeholder="10-digit mobile" /></div>
              <div className="sm:col-span-2"><label className="label">Email (for order updates)</label><input type="email" className="input" value={addr.email} onChange={set('email')} /></div>
              <div className="sm:col-span-2"><label className="label">House / Flat / Street *</label><input required className="input" value={addr.line1} onChange={set('line1')} /></div>
              <div className="sm:col-span-2"><label className="label">Area / Landmark</label><input className="input" value={addr.line2} onChange={set('line2')} /></div>
              <div><label className="label">City *</label><input required className="input" value={addr.city} onChange={set('city')} /></div>
              <div>
                <label className="label">State *</label>
                <select required className="input" value={addr.state} onChange={set('state')}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="label">Pincode *</label><input required inputMode="numeric" pattern="\d{6}" maxLength={6} className="input" value={addr.pincode} onChange={set('pincode')} /></div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-lg font-bold">Payment Method</h3>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-rose-500 bg-rose-50/50 p-4">
              <span>
                <span className="block font-semibold text-navy-900">Cash on Delivery</span>
                <span className="text-xs text-slate-500">Pay in cash or UPI when your order arrives</span>
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white"><FiCheck size={14} /></span>
            </label>
            <p className="mt-3 text-xs text-slate-400">Online payment (UPI / Cards) coming soon.</p>
            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={discreet} onChange={(e) => setDiscreet(e.target.checked)} className="h-4 w-4 accent-rose-500" />
              Pack my order discreetly (no product names on the box)
            </label>
            <div className="mt-4">
              <label className="label">Order notes (optional)</label>
              <textarea rows={2} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any delivery instructions" />
            </div>
          </div>
        </div>

        <div>
          <div className="card sticky top-24 p-6">
            <h3 className="mb-4 text-lg font-bold">Order Summary</h3>
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i._id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 rounded-lg bg-rose-50">
                    <img src={imgUrl(i.image)} alt="" className="h-full w-full object-contain p-1" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-700 text-[10px] font-bold text-white">{i.qty}</span>
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm text-navy-900">{i.name}</p>
                  <span className="text-sm font-semibold">{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              {applied ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-emerald-700"><FiTag /> {applied}</span>
                  <button type="button" onClick={removeCoupon} className="text-xs font-semibold text-red-500">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="input uppercase" />
                  <button type="button" onClick={applyCoupon} className="btn-outline">Apply</button>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 text-sm">
              {quote ? (
                <>
                  <div className="flex justify-between"><span>Items total</span><span>{inr(quote.itemsTotal)}</span></div>
                  {quote.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon discount</span><span>-{inr(quote.discount)}</span></div>}
                  <div className="flex justify-between"><span>Shipping</span><span>{quote.shippingFee ? inr(quote.shippingFee) : 'FREE'}</span></div>
                  <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-navy-900"><span>Total</span><span>{inr(quote.total)}</span></div>
                </>
              ) : (
                <div className="flex justify-center py-4"><Spinner /></div>
              )}
            </div>
            <button disabled={placing || quoting || !quote} className="btn-primary mt-5 w-full py-3.5 text-base">
              {placing ? <Spinner className="h-5 w-5 border-white/40 border-t-white" /> : <FiLock />} Place Order
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">By placing the order you agree to our <Link to="/policy/terms" className="underline">Terms</Link>.</p>
          </div>
        </div>
      </form>
    </>
  );
}
