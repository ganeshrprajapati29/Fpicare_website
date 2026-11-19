import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { imgUrl } from '../../api/client';
import { inr } from '../../utils/format';

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, setQty, remove } = useCart();
  const { settings } = useSettings();
  const nav = useNavigate();
  const left = Math.max(0, settings.freeShippingAbove - subtotal);
  const pct = Math.min(100, (subtotal / (settings.freeShippingAbove || 1)) * 100);
  const go = (to) => {
    setDrawerOpen(false);
    nav(to);
  };

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-navy-900/40 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold">Your Cart</h3>
          <button onClick={() => setDrawerOpen(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close cart">
            <FiX size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-rose-50 p-6 text-rose-500">
              <FiShoppingBag size={36} />
            </div>
            <p className="font-semibold text-navy-900">Your cart is empty</p>
            <button className="btn-primary" onClick={() => go('/shop')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-600">
                {left > 0 ? (
                  <>Add <b className="text-rose-600">{inr(left)}</b> more for <b>FREE delivery</b></>
                ) : (
                  <b className="text-emerald-600">🎉 You've unlocked FREE delivery!</b>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((i) => (
                <div key={i._id} className="flex gap-3">
                  <Link to={`/product/${i.slug}`} onClick={() => setDrawerOpen(false)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose-50">
                    <img src={imgUrl(i.image)} alt={i.name} className="h-full w-full object-contain p-1" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-navy-900">{i.name}</p>
                    <p className="mt-0.5 text-sm font-bold text-rose-600">{inr(i.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-slate-200">
                        <button className="p-1.5 px-2.5" onClick={() => setQty(i._id, i.qty - 1)} aria-label="Decrease">
                          <FiMinus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                        <button className="p-1.5 px-2.5" onClick={() => setQty(i._id, i.qty + 1)} aria-label="Increase">
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <button onClick={() => remove(i._id)} className="p-1.5 text-slate-400 hover:text-red-500" aria-label="Remove">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-slate-100 p-5">
              <div className="flex justify-between text-base font-bold text-navy-900">
                <span>Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">Shipping & coupons calculated at checkout. Ships in plain, unbranded packaging.</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-outline" onClick={() => go('/cart')}>View Cart</button>
                <button className="btn-primary" onClick={() => go('/checkout')}>Checkout</button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
