import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiPhone, FiLogOut, FiGrid, FiPackage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=condoms', label: 'Condoms' },
  { to: '/shop?category=contraceptive-pills', label: 'Pills' },
  { to: '/learn', label: 'Learn' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const { count, setDrawerOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const search = (e) => {
    e.preventDefault();
    nav(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setOpen(false);
  };

  return (
    <>
      {settings.announcement && (
        <div className="bg-brand px-4 py-2 text-center text-[11px] font-medium text-white sm:text-xs">{settings.announcement}</div>
      )}
      <header className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition ${scrolled ? 'border-slate-100 shadow-sm' : 'border-transparent'}`}>
        <div className="container-x flex h-16 items-center gap-3 sm:h-20">
          <button className="rounded-full p-2 text-navy-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <FiMenu size={22} />
          </button>
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo.png" alt="FPicare" className="h-11 w-11 rounded-full shadow-md transition duration-500 hover:rotate-[360deg] sm:h-14 sm:w-14" />
            <div className="hidden leading-none sm:block">
              <p className="text-xl font-extrabold tracking-tight text-navy-800">
                FP<span className="text-rose-500">icare</span>
              </p>
              <p className="font-script text-sm text-navy-600">Care for Every Couple</p>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `relative rounded-full px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:rounded-full after:bg-rose-500 after:transition after:duration-300 ${
                    isActive && !n.to.includes('?') ? 'text-rose-600 after:scale-x-100' : 'text-navy-800 after:scale-x-0 hover:text-rose-600 hover:after:scale-x-100'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden max-w-xs flex-1 md:block">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input rounded-full pl-10" />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <div className="relative">
              <button
                onClick={() => (user ? setMenu((m) => !m) : nav('/login'))}
                className="flex items-center gap-2 rounded-full p-2.5 text-navy-800 hover:bg-navy-50"
                aria-label="Account"
              >
                <FiUser size={20} />
                {user && <span className="hidden max-w-[90px] truncate text-sm font-medium xl:inline">{user.name.split(' ')[0]}</span>}
              </button>
              {menu && user && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl animate-fadeUp">
                    <p className="border-b border-slate-100 px-4 pb-2 text-xs text-slate-500">
                      Signed in as <span className="block truncate font-semibold text-navy-900">{user.email}</span>
                    </p>
                    {isAdmin && (
                      <Link onClick={() => setMenu(false)} to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-rose-50">
                        <FiGrid /> Admin Panel
                      </Link>
                    )}
                    <Link onClick={() => setMenu(false)} to="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-rose-50">
                      <FiPackage /> My Orders
                    </Link>
                    <Link onClick={() => setMenu(false)} to="/account/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-rose-50">
                      <FiUser /> Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenu(false);
                        nav('/');
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setDrawerOpen(true)} className="relative rounded-full p-2.5 text-navy-800 hover:bg-navy-50" aria-label="Cart">
              <FiShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-navy-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <aside className={`absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <img src="/logo.png" alt="FPicare" className="h-12 w-12 rounded-full" />
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close menu">
              <FiX size={22} />
            </button>
          </div>
          <form onSubmit={search} className="p-4">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input rounded-full pl-10" />
            </div>
          </form>
          <nav className="flex-1 overflow-y-auto px-2">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-medium text-navy-800 hover:bg-rose-50">
                {n.label}
              </Link>
            ))}
            <Link to="/track-order" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-medium text-navy-800 hover:bg-rose-50">
              Track Order
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50">
                Admin Panel
              </Link>
            )}
          </nav>
          <a href={`tel:${settings.phone}`} className="m-4 flex items-center justify-center gap-2 rounded-full bg-navy-50 py-3 text-sm font-semibold text-navy-800">
            <FiPhone /> {settings.phone}
          </a>
        </aside>
      </div>
    </>
  );
}
