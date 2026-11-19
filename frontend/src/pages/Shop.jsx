import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import api from '../api/client';
import ProductCard, { ProductSkeleton } from '../components/ProductCard';
import { Empty, PageHero, useTitle } from '../components/ui';

const SORTS = [
  ['newest', 'Newest'],
  ['popular', 'Popularity'],
  ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
  ['rating', 'Top Rated'],
];
const PRICES = [
  ['', '', 'Any price'],
  ['0', '100', 'Under ₹100'],
  ['100', '200', '₹100 – ₹200'],
  ['200', '500', '₹200 – ₹500'],
  ['500', '', 'Above ₹500'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [data, setData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState(params.get('q') || '');

  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const hormoneFree = params.get('hormoneFree') === '1';
  const activeCat = cats.find((c) => c.slug === category);
  useTitle(activeCat?.name || 'Shop');

  useEffect(() => {
    api.get('/categories').then(({ data: d }) => setCats(d)).catch(() => {});
  }, []);

  useEffect(() => {
    setQ(params.get('q') || '');
    setData(null);
    const p = Object.fromEntries(params.entries());
    api
      .get('/products', { params: { limit: 12, ...p } })
      .then(({ data: d }) => setData(d))
      .catch(() => setData({ items: [], total: 0, pages: 1 }));
  }, [params]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
    setShowFilters(false);
  };

  const Filters = (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-sm font-bold text-navy-900">Categories</h4>
        <div className="space-y-1">
          <button onClick={() => update({ category: '' })} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${!category ? 'bg-rose-50 font-semibold text-rose-600' : 'hover:bg-slate-50'}`}>
            All products
          </button>
          {cats.map((c) => (
            <button key={c._id} onClick={() => update({ category: c.slug })} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${category === c.slug ? 'bg-rose-50 font-semibold text-rose-600' : 'hover:bg-slate-50'}`}>
              {c.name} <span className="text-xs text-slate-400">{c.productCount}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold text-navy-900">Price</h4>
        <div className="space-y-1">
          {PRICES.map(([mn, mx, label]) => (
            <button key={label} onClick={() => update({ minPrice: mn, maxPrice: mx })} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${minPrice === mn && maxPrice === mx ? 'bg-rose-50 font-semibold text-rose-600' : 'hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        <input type="checkbox" checked={hormoneFree} onChange={(e) => update({ hormoneFree: e.target.checked ? '1' : '' })} className="h-4 w-4 accent-emerald-600" />
        Hormone-free only
      </label>
    </div>
  );

  return (
    <>
      <PageHero crumb="Shop" title={activeCat?.name || (params.get('q') ? `Results for “${params.get('q')}”` : 'All Products')} subtitle={activeCat?.description || 'Genuine family planning & wellness products, shipped discreetly.'} />
      <div className="container-x py-10">
        <div className="flex gap-8">
          <aside className="hidden w-60 shrink-0 lg:block">{Filters}</aside>
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  update({ q: q.trim() });
                }}
                className="relative min-w-[200px] flex-1"
              >
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in shop…" className="input rounded-full pl-10" />
              </form>
              <button onClick={() => setShowFilters(true)} className="btn-outline lg:hidden"><FiFilter /> Filters</button>
              <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="input w-auto rounded-full">
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {data && <p className="mb-4 text-sm text-slate-500">{data.total} product{data.total === 1 ? '' : 's'} found</p>}

            {data === null ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, k) => <ProductSkeleton key={k} />)}
              </div>
            ) : data.items.length === 0 ? (
              <Empty icon={<FiSearch />} title="No products found" text="Try a different search or clear the filters." action={<button className="btn-primary" onClick={() => setParams({})}>Clear filters</button>} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                  {data.items.map((p) => <ProductCard key={p._id} p={p} />)}
                </div>
                {data.pages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: data.pages }).map((_, k) => (
                      <button key={k} onClick={() => update({ page: String(k + 1) })} className={`h-10 w-10 rounded-full text-sm font-semibold ${page === k + 1 ? 'bg-rose-500 text-white' : 'bg-white text-navy-800 shadow-sm hover:bg-rose-50'}`}>
                        {k + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 animate-fadeUp">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="rounded-full p-2 hover:bg-slate-100"><FiX /></button>
            </div>
            {Filters}
          </div>
        </div>
      )}
    </>
  );
}
