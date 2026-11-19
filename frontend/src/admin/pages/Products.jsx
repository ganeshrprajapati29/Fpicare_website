import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import api, { errMsg, imgUrl } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { inr } from '../../utils/format';
import { PageHeader, Table, Toggle } from '../ui';

export default function Products() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const load = () =>
    api.get('/products', { params: { all: 1, limit: 20, page, q: q || undefined } }).then(({ data: d }) => setData(d));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const patch = async (p, body) => {
    try {
      await api.put(`/products/${p._id}`, body);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title="Products" subtitle={data ? `${data.total} products` : ''} action={<Link to="/admin/products/new" className="btn-primary"><FiPlus /> Add product</Link>} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
        className="relative mb-4 max-w-sm"
      >
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input pl-10" />
      </form>
      {!data ? (
        <PageLoader />
      ) : (
        <>
          <Table head={['Product', 'Category', 'Price', 'Stock', 'Featured', 'Active', '']} empty={data.items.length ? null : 'No products found'}>
            {data.items.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={imgUrl(p.images?.[0])} alt="" className="h-12 w-12 rounded-lg bg-rose-50 object-contain" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-semibold text-navy-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.sku || p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.category?.name || '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{inr(p.price)}</p>
                  {p.mrp > p.price && <p className="text-xs text-slate-400 line-through">{inr(p.mrp)}</p>}
                </td>
                <td className="px-4 py-3"><span className={`badge ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{p.stock}</span></td>
                <td className="px-4 py-3"><Toggle checked={p.isFeatured} onChange={(v) => patch(p, { isFeatured: v })} /></td>
                <td className="px-4 py-3"><Toggle checked={p.isActive} onChange={(v) => patch(p, { isActive: v })} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link to={`/admin/products/${p._id}`} className="rounded-lg p-2 text-navy-600 hover:bg-navy-50" aria-label="Edit"><FiEdit2 /></Link>
                    <button onClick={() => del(p)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          {data.pages > 1 && (
            <div className="mt-4 flex justify-end gap-2">
              {Array.from({ length: data.pages }).map((_, k) => (
                <button key={k} onClick={() => setPage(k + 1)} className={`h-9 w-9 rounded-lg text-sm font-semibold ${page === k + 1 ? 'bg-rose-500 text-white' : 'bg-white'}`}>{k + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
