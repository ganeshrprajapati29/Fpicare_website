import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { imgUrl } from '../api/client';
import { inr } from '../utils/format';
import { Empty, PageHero, useTitle } from '../components/ui';

export default function Cart() {
  useTitle('Cart');
  const { items, subtotal, savings, setQty, remove } = useCart();
  const { settings } = useSettings();
  const nav = useNavigate();
  const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingFee;

  return (
    <>
      <PageHero crumb="Cart" title="Shopping Cart" />
      <div className="container-x py-10">
        {items.length === 0 ? (
          <Empty icon={<FiShoppingBag />} title="Your cart is empty" text="Looks like you haven't added anything yet." action={<Link to="/shop" className="btn-primary">Start shopping</Link>} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((i) => (
                <div key={i._id} className="card flex gap-4 p-4">
                  <Link to={`/product/${i.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-rose-50 sm:h-28 sm:w-28">
                    <img src={imgUrl(i.image)} alt={i.name} className="h-full w-full object-contain p-1" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link to={`/product/${i.slug}`} className="line-clamp-2 font-semibold text-navy-900 hover:text-rose-600">{i.name}</Link>
                    <div className="mt-1 text-sm">
                      <span className="font-bold text-navy-900">{inr(i.price)}</span>
                      {i.mrp > i.price && <span className="ml-2 text-xs text-slate-400 line-through">{inr(i.mrp)}</span>}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-slate-200">
                        <button className="p-2 px-3" onClick={() => setQty(i._id, i.qty - 1)} aria-label="Decrease"><FiMinus size={13} /></button>
                        <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                        <button className="p-2 px-3" onClick={() => setQty(i._id, i.qty + 1)} aria-label="Increase"><FiPlus size={13} /></button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="hidden font-bold text-navy-900 sm:inline">{inr(i.price * i.qty)}</span>
                        <button onClick={() => remove(i._id)} className="text-slate-400 hover:text-red-500" aria-label="Remove"><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="card sticky top-24 space-y-3 p-6">
                <h3 className="text-lg font-bold">Order Summary</h3>
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                {savings > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>You save</span><span>-{inr(savings)}</span></div>}
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping ? inr(shipping) : 'FREE'}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-navy-900"><span>Total</span><span>{inr(subtotal + shipping)}</span></div>
                <p className="text-xs text-slate-500">Have a coupon? Apply it at checkout.</p>
                <button className="btn-primary w-full py-3" onClick={() => nav('/checkout')}><FiLock /> Proceed to Checkout</button>
                <Link to="/shop" className="block text-center text-sm font-medium text-navy-700 hover:text-rose-600">Continue shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
