import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiBox, FiTag, FiShoppingCart, FiUsers, FiMail, FiPercent, FiSettings, FiMenu, FiX, FiLogOut, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  ['/admin', 'Dashboard', FiGrid, true],
  ['/admin/orders', 'Orders', FiShoppingCart],
  ['/admin/products', 'Products', FiBox],
  ['/admin/categories', 'Categories', FiTag],
  ['/admin/coupons', 'Coupons', FiPercent],
  ['/admin/users', 'Customers', FiUsers],
  ['/admin/enquiries', 'Enquiries', FiMail],
  ['/admin/settings', 'Settings', FiSettings],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);
  useEffect(() => {
    document.title = 'Admin | FPicare';
  }, []);

  const Side = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="" className="h-11 w-11 rounded-full bg-white" />
        <div>
          <p className="text-lg font-extrabold text-white">FP<span className="text-rose-400">icare</span></p>
          <p className="text-[11px] uppercase tracking-widest text-navy-200">Admin Panel</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {LINKS.map(([to, label, Icon, end]) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-rose-500 text-white shadow-glow' : 'text-navy-100 hover:bg-white/10'}`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-navy-100 hover:bg-white/10"><FiExternalLink /> View website</Link>
        <button onClick={() => { logout(); nav('/admin/login'); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-navy-100 hover:bg-white/10"><FiLogOut /> Logout</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy-900 lg:block">{Side}</aside>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 transition ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-64 bg-navy-900 transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setOpen(false)} className="absolute right-3 top-5 p-2 text-white" aria-label="Close"><FiX /></button>
          {Side}
        </aside>
      </div>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Menu"><FiMenu size={20} /></button>
          <p className="font-semibold text-navy-900">{LINKS.find(([to, , , end]) => (end ? loc.pathname === to : loc.pathname.startsWith(to)))?.[1] || 'Admin'}</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">{user?.name?.[0]}</div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
