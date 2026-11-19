import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPackage, FiUser, FiLock } from 'react-icons/fi';
import api, { errMsg, imgUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Empty, PageHero, PageLoader, useTitle } from '../../components/ui';
import { inr, date, STATUS_STYLES } from '../../utils/format';
import { OrderTimeline } from '../TrackOrder';

function Orders() {
  useTitle('My Orders');
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState(null);
  const load = () => api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  useEffect(() => {
    load();
  }, []);
  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  if (!orders) return <PageLoader />;
  if (!orders.length) return <Empty icon={<FiPackage />} title="No orders yet" text="Your orders will appear here." />;
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o._id} className="card overflow-hidden">
          <button onClick={() => setOpen(open === o._id ? null : o._id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left">
            <div>
              <p className="font-bold text-navy-900">#{o.orderNumber}</p>
              <p className="text-xs text-slate-500">{date(o.createdAt, true)} · {o.items.length} item(s)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{inr(o.total)}</span>
              <span className={`badge px-3 py-1 capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span>
            </div>
          </button>
          {open === o._id && (
            <div className="space-y-5 border-t border-slate-100 p-5">
              <OrderTimeline order={o} />
              {o.items.map((i) => (
                <div key={i._id} className="flex items-center gap-3">
                  <img src={imgUrl(i.image)} alt="" className="h-12 w-12 rounded-lg bg-rose-50 object-contain p-1" />
                  <p className="flex-1 text-sm">{i.name} × {i.qty}</p>
                  <span className="text-sm font-semibold">{inr(i.price * i.qty)}</span>
                </div>
              ))}
              <p className="text-xs text-slate-500">
                Ship to: {o.shippingAddress.fullName}, {o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}
              </p>
              {['pending', 'confirmed'].includes(o.status) && (
                <button onClick={() => cancel(o._id)} className="btn border border-red-200 text-red-600 hover:bg-red-50">Cancel order</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Profile() {
  useTitle('Profile');
  const { user, updateProfile } = useAuth();
  const def = user.addresses?.[0] || {};
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [addr, setAddr] = useState({ line1: def.line1 || '', line2: def.line2 || '', city: def.city || '', state: def.state || '', pincode: def.pincode || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const save = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ ...form, addresses: addr.line1 ? [{ ...addr, fullName: form.name, phone: form.phone, isDefault: true }] : [] });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pw);
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const a = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h3 className="text-lg font-bold sm:col-span-2">Personal details</h3>
        <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Mobile</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Email</label><input className="input bg-slate-50" value={user.email} disabled /></div>
        <h3 className="mt-2 text-lg font-bold sm:col-span-2">Default address</h3>
        <div className="sm:col-span-2"><label className="label">House / Street</label><input className="input" value={addr.line1} onChange={a('line1')} /></div>
        <div className="sm:col-span-2"><label className="label">Area / Landmark</label><input className="input" value={addr.line2} onChange={a('line2')} /></div>
        <div><label className="label">City</label><input className="input" value={addr.city} onChange={a('city')} /></div>
        <div><label className="label">State</label><input className="input" value={addr.state} onChange={a('state')} /></div>
        <div><label className="label">Pincode</label><input className="input" value={addr.pincode} onChange={a('pincode')} /></div>
        <div className="sm:col-span-2"><button className="btn-primary">Save changes</button></div>
      </form>
      <form onSubmit={changePw} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h3 className="text-lg font-bold sm:col-span-2">Change password</h3>
        <div><label className="label">Current password</label><input type="password" required className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
        <div><label className="label">New password</label><input type="password" required minLength={6} className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
        <div className="sm:col-span-2"><button className="btn-navy">Update password</button></div>
      </form>
    </div>
  );
}

export default function Account() {
  const { user } = useAuth();
  const link = ({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-rose-50 text-rose-600' : 'text-navy-800 hover:bg-slate-50'}`;
  return (
    <>
      <PageHero crumb="My account" title={`Hi, ${user.name.split(' ')[0]} 👋`} subtitle="Manage your orders and profile." />
      <div className="container-x grid gap-8 py-10 lg:grid-cols-4">
        <aside className="card h-fit p-3">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            <NavLink end to="/account" className={link}><FiPackage /> Orders</NavLink>
            <NavLink to="/account/profile" className={link}><FiUser /> Profile</NavLink>
            <NavLink to="/track-order" className={link}><FiLock /> Track by number</NavLink>
          </nav>
        </aside>
        <div className="lg:col-span-3">
          <Routes>
            <Route index element={<Orders />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
