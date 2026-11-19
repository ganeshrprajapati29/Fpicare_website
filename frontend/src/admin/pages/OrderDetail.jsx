import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPrinter, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api, { errMsg, imgUrl } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { inr, date, STATUS_STYLES } from '../../utils/format';
import { PageHeader, Panel } from '../ui';

const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [form, setForm] = useState({ status: '', note: '', trackingId: '', courier: '', paymentStatus: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setO(data);
      setForm({ status: data.status, note: '', trackingId: data.trackingId || '', courier: data.courier || '', paymentStatus: data.paymentStatus });
    });
  }, [id]);

  if (!o) return <PageLoader />;
  const a = o.shippingAddress;
  const phone10 = String(a.phone).replace(/\D/g, '').slice(-10);

  const save = async (e) => {
    e.preventDefault();
    if (form.status === 'cancelled' && o.status !== 'cancelled' && !window.confirm('Cancel this order? Stock will be restored.')) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/orders/${o._id}`, form);
      setO(data);
      setForm((f) => ({ ...f, note: '' }));
      toast.success('Order updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Order #${o.orderNumber}`}
        subtitle={`Placed ${date(o.createdAt, true)}`}
        action={
          <div className="flex gap-2">
            <Link to="/admin/orders" className="btn-outline"><FiArrowLeft /> Back</Link>
            <button onClick={() => window.print()} className="btn-outline"><FiPrinter /> Print</button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Items</h3>
              <span className={`badge px-3 py-1 capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {o.items.map((i) => (
                <div key={i._id} className="flex items-center gap-4 py-3">
                  <img src={imgUrl(i.image)} alt="" className="h-14 w-14 rounded-lg bg-rose-50 object-contain p-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy-900">{i.name}</p>
                    <p className="text-xs text-slate-500">{inr(i.price)} × {i.qty}</p>
                  </div>
                  <span className="font-bold">{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between"><span>Items total</span><span>{inr(o.itemsTotal)}</span></div>
              {o.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount {o.couponCode && `(${o.couponCode})`}</span><span>-{inr(o.discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{o.shippingFee ? inr(o.shippingFee) : 'FREE'}</span></div>
              <div className="flex justify-between pt-2 text-lg font-bold text-navy-900"><span>Total</span><span>{inr(o.total)}</span></div>
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="mb-4 font-bold">Status history</h3>
            <ol className="space-y-3 border-l-2 border-rose-100 pl-5">
              {o.statusHistory.map((h) => (
                <li key={h._id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-rose-500" />
                  <p className="text-sm font-semibold capitalize text-navy-900">{h.status}</p>
                  <p className="text-xs text-slate-500">{date(h.at, true)}{h.note ? ` · ${h.note}` : ''}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel className="p-6">
            <h3 className="mb-3 font-bold">Customer</h3>
            <p className="font-semibold text-navy-900">{a.fullName}</p>
            <p className="text-sm text-slate-600">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
            <p className="text-sm text-slate-600">{a.city}, {a.state} – {a.pincode}</p>
            {a.email && <p className="mt-2 text-sm text-slate-600">{a.email}</p>}
            <div className="mt-4 flex gap-2">
              <a href={`tel:${a.phone}`} className="btn-outline flex-1 py-2"><FiPhone /> Call</a>
              <a href={`https://wa.me/91${phone10}?text=${encodeURIComponent(`Hi ${a.fullName}, regarding your FPicare order #${o.orderNumber}`)}`} target="_blank" rel="noreferrer" className="btn flex-1 bg-[#25D366] py-2 text-white"><FaWhatsapp /> WhatsApp</a>
            </div>
            <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p>Payment: <b>{o.paymentMethod}</b> ({o.paymentStatus})</p>
              <p>Discreet packaging: <b>{o.discreetPackaging ? 'Yes' : 'No'}</b></p>
              {o.user && <p>Account: <b>{o.user.email}</b></p>}
              {o.notes && <p>Note: <b>{o.notes}</b></p>}
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="mb-4 font-bold">Update order</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select className="input capitalize" value={form.status} disabled={o.status === 'cancelled'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Payment status</label>
                <select className="input capitalize" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                  {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Courier</label><input className="input" value={form.courier} onChange={(e) => setForm({ ...form, courier: e.target.value })} /></div>
                <div><label className="label">Tracking ID</label><input className="input" value={form.trackingId} onChange={(e) => setForm({ ...form, trackingId: e.target.value })} /></div>
              </div>
              <div><label className="label">Note (optional)</label><input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
              <button disabled={saving} className="btn-primary w-full">Save changes</button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
