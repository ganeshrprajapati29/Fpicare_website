import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiCheck } from 'react-icons/fi';
import api, { errMsg } from '../api/client';
import { PageHero, Spinner, useTitle } from '../components/ui';
import { inr, date, ORDER_FLOW, STATUS_STYLES } from '../utils/format';

export function OrderTimeline({ order }) {
  if (order.status === 'cancelled') return <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">This order has been cancelled.</p>;
  const idx = ORDER_FLOW.indexOf(order.status);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_FLOW.map((s, k) => (
        <li key={s} className="flex flex-col items-center text-center">
          <div className="flex w-full items-center">
            <div className={`h-1 flex-1 ${k === 0 ? 'invisible' : k <= idx ? 'bg-rose-500' : 'bg-slate-200'}`} />
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${k <= idx ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {k <= idx ? <FiCheck /> : k + 1}
            </span>
            <div className={`h-1 flex-1 ${k === ORDER_FLOW.length - 1 ? 'invisible' : k < idx ? 'bg-rose-500' : 'bg-slate-200'}`} />
          </div>
          <span className={`mt-2 text-[10px] font-semibold capitalize sm:text-xs ${k <= idx ? 'text-navy-900' : 'text-slate-400'}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export default function TrackOrder() {
  useTitle('Track Order');
  const [params] = useSearchParams();
  const [form, setForm] = useState({ orderNumber: params.get('orderNumber') || '', phone: '' });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await api.get('/orders/track', { params: form });
      setOrder(data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero crumb="Help" title="Track Your Order" subtitle="Enter your order number and the mobile number used while ordering." />
      <div className="container-x max-w-3xl py-10">
        <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div><label className="label">Order number</label><input required className="input uppercase" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} placeholder="FPC…" /></div>
          <div><label className="label">Mobile number</label><input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <button disabled={loading} className="btn-primary py-3">{loading ? <Spinner className="h-4 w-4" /> : <FiSearch />} Track</button>
        </form>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
        {order && (
          <div className="card mt-6 space-y-6 p-6 animate-fadeUp">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Order #{order.orderNumber}</p>
                <p className="text-sm text-slate-600">Placed on {date(order.createdAt, true)}</p>
              </div>
              <span className={`badge px-3 py-1 text-xs capitalize ${STATUS_STYLES[order.status]}`}>{order.status}</span>
            </div>
            <OrderTimeline order={order} />
            {order.trackingId && (
              <p className="rounded-xl bg-navy-50 p-4 text-sm text-navy-800">Courier: <b>{order.courier || '—'}</b> · Tracking ID: <b>{order.trackingId}</b></p>
            )}
            <div className="divide-y divide-slate-100">
              {order.items.map((i) => (
                <div key={i._id} className="flex justify-between py-3 text-sm">
                  <span>{i.name} × {i.qty}</span>
                  <span className="font-semibold">{inr(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-bold text-navy-900"><span>Total</span><span>{inr(order.total)}</span></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
