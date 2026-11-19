import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../../api/client';
import { PageLoader } from '../../components/ui';
import { inr, date, STATUS_STYLES } from '../../utils/format';
import { PageHeader, Table } from '../ui';

const STATUSES = ['', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [q, setQ] = useState(params.get('q') || '');
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setData(null);
    api.get('/orders/admin', { params: { status: status || undefined, q: params.get('q') || undefined, page } }).then(({ data: d }) => setData(d));
  }, [params, status, page]);

  const set = (patch) => {
    const n = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    if (!('page' in patch)) n.delete('page');
    setParams(n);
  };

  return (
    <>
      <PageHeader title="Orders" subtitle={data ? `${data.total} orders` : ''} />
      <div className="mb-4 flex flex-wrap gap-3">
        <form onSubmit={(e) => { e.preventDefault(); set({ q }); }} className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order no., name, phone…" className="input pl-10" />
        </form>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {STATUSES.map((s) => (
            <button key={s || 'all'} onClick={() => set({ status: s })} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold capitalize ${status === s ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      {!data ? (
        <PageLoader />
      ) : (
        <>
          <Table head={['Order', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status']} empty={data.items.length ? null : 'No orders found'}>
            {data.items.map((o) => (
              <tr key={o._id} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3"><Link to={`/admin/orders/${o._id}`} className="font-semibold text-rose-600 hover:underline">#{o.orderNumber}</Link></td>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">{o.shippingAddress.fullName}</p>
                  <p className="text-xs text-slate-400">{o.shippingAddress.phone}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{date(o.createdAt, true)}</td>
                <td className="px-4 py-3">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                <td className="px-4 py-3 font-bold">{inr(o.total)}</td>
                <td className="px-4 py-3 text-xs"><span className="font-semibold">{o.paymentMethod}</span> · <span className="capitalize">{o.paymentStatus}</span></td>
                <td className="px-4 py-3"><span className={`badge px-3 py-1 capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span></td>
              </tr>
            ))}
          </Table>
          {data.pages > 1 && (
            <div className="mt-4 flex justify-end gap-2">
              {Array.from({ length: data.pages }).map((_, k) => (
                <button key={k} onClick={() => set({ page: String(k + 1) })} className={`h-9 w-9 rounded-lg text-sm font-semibold ${page === k + 1 ? 'bg-rose-500 text-white' : 'bg-white'}`}>{k + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
