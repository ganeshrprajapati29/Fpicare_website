import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { imgUrl } from '../api/client';
import { useCart } from '../context/CartContext';
import { inr } from '../utils/format';
import { Stars } from './ui';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <div className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-rose-50 to-navy-50">
        <img src={imgUrl(p.images?.[0])} alt={p.name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {off > 0 && <span className="badge bg-rose-500 text-white">{off}% OFF</span>}
          {p.hormoneFree && <span className="badge bg-emerald-500 text-white">Hormone-free</span>}
          {p.isBestSeller && <span className="badge bg-navy-700 text-white">Bestseller</span>}
        </div>
        {p.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-slate-700">Out of stock</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {p.category?.name && <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-500">{p.category.name}</p>}
        <Link to={`/product/${p.slug}`} className="mt-1 line-clamp-2 text-sm font-semibold text-navy-900 hover:text-rose-600 sm:text-[15px]">
          {p.name}
        </Link>
        {p.numReviews > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Stars value={p.rating} size={12} /> ({p.numReviews})
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <span className="text-lg font-bold text-navy-900">{inr(p.price)}</span>
            {off > 0 && <span className="ml-1.5 text-xs text-slate-400 line-through">{inr(p.mrp)}</span>}
          </div>
          <button
            type="button"
            onClick={() => add(p)}
            disabled={p.stock <= 0}
            aria-label={`Add ${p.name} to cart`}
            className="rounded-full bg-navy-700 p-2.5 text-white transition hover:bg-rose-500 disabled:opacity-40"
          >
            <FiShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-1/4 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
