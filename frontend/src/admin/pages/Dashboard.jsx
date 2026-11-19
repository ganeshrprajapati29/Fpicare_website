import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingCart, FiBox, FiUsers, FiMail, FiAlertTriangle } from 'react-icons/fi';
import api, { imgUrl } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { inr, date, STATUS_STYLES } from '../../utils/format';
import { PageHeader, Panel } from '../ui';

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <Panel className="flex items-center gap-4 p-5">
      <div className={`rounded-2xl p-3.5 ${tone}`}><Icon size={22} /></div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl font-extrabold text-navy-900">{value}</p>
      </div>
    </Panel>
  );
}

function RevenueChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.revenue));
  return (
    <div className="flex h-56 items-end gap-1.5 sm:gap-2">
      {days.map((d) => (
        <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
          <div className="pointer-events-none absolute -top-12 z-10 hidden whitespace-nowrap rounded-lg bg-navy-900 px-2 py-1 text-[11px] text-white group-hover:block">
            {inr(d.revenue)} · {d.orders} orders
          </div>
          <div className="w-full rounded-t-md bg-gradient-to-t from-navy-600 to-rose-500 transition group-hover:opacity-80" style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }} />
          <span className="mt-2 text-[9px] text-slate-400 sm:text-[10px]">{d.date.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setS(data));
  }, []);
  if (!s) return <PageLoader />;
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your store" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={FiDollarSign} label="Revenue" value={inr(s.revenue)} tone="bg-rose-50 text-rose-500" />
        <Stat icon={FiShoppingCart} label="Orders" value={s.totalOrders} tone="bg-navy-50 text-navy-600" />
        <Stat icon={FiBox} label="Products" value={s.totalProducts} tone="bg-violet-50 text-violet-600" />
        <Stat icon={FiUsers} label="Customers" value={s.totalUsers} tone="bg-emerald-50 text-emerald-600" />
        <Stat icon={FiMail} label="New enquiries" value={s.newEnquiries} tone="bg-amber-50 text-amber-600" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel className="p-6 xl:col-span-2">
          <h3 className="mb-6 font-bold">Revenue – last 14 days</h3>
          <RevenueChart days={s.daily} />
        </Panel>
        <Panel className="p-6">
          <h3 className="mb-4 font-bold">Orders by status</h3>
          <div className="space-y-3">
            {['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((k) => (
              <Link key={k} to={`/admin/orders?status=${k}`} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50">
                <span className={`badge px-3 py-1 capitalize ${STATUS_STYLES[k]}`}>{k}</span>
                <span className="font-bold text-navy-900">{s.byStatus[k] || 0}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Recent orders</h3>
            <Link to="/admin/orders" className="text-sm font-semibold text-rose-600">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {s.recentOrders.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No orders yet</p>}
            {s.recentOrders.map((o) => (
              <Link key={o._id} to={`/admin/orders/${o._id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-navy-900">#{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">{o.shippingAddress.fullName} · {date(o.createdAt, true)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{inr(o.total)}</span>
                  <span className={`badge px-2.5 py-1 capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel className="p-6">
            <h3 className="mb-4 font-bold">Top selling</h3>
            <div className="space-y-3">
              {s.topProducts.map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={imgUrl(p.images?.[0])} alt="" className="h-10 w-10 rounded-lg bg-rose-50 object-contain" />
                  <p className="line-clamp-1 flex-1 text-sm">{p.name}</p>
                  <span className="text-xs font-bold text-slate-500">{p.sold} sold</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold"><FiAlertTriangle className="text-amber-500" /> Low stock</h3>
            {s.lowStock.length === 0 ? (
              <p className="text-sm text-slate-400">All products are well stocked.</p>
            ) : (
              <div className="space-y-2">
                {s.lowStock.map((p) => (
                  <Link key={p._id} to={`/admin/products/${p._id}`} className="flex items-center justify-between text-sm hover:text-rose-600">
                    <span className="line-clamp-1">{p.name}</span>
                    <span className="badge bg-red-50 text-red-600">{p.stock} left</span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
