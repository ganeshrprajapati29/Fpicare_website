import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { Spinner } from '../components/ui';

export function AdminShell({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4 py-10">
      <div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-rose-500/30 blur-3xl" />
      <div className="animate-blob absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-navy-500/40 blur-3xl [animation-delay:5s]" />
      <div className="relative w-full max-w-md animate-fadeUp rounded-3xl bg-white p-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,.6)] sm:p-10">
        {children}
      </div>
    </div>
  );
}

export default function AdminLogin() {
  const { user, login, logout } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/admin';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (user?.role === 'admin') return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      if (u.role !== 'admin') {
        logout();
        toast.error('This account does not have admin access');
        return;
      }
      toast.success(`Welcome, ${u.name.split(' ')[0]}!`);
      nav(next, { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="text-center">
        <img src="/logo.png" alt="FPicare" className="mx-auto h-20 w-20 rounded-full shadow-lg" />
        <span className="badge mt-4 bg-navy-50 px-3 py-1 text-navy-700"><FiShield /> Admin Panel</span>
        <h1 className="mt-3 text-2xl font-extrabold">Sign in to dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage products, orders and store settings</p>
      </div>
      {user && user.role !== 'admin' && (
        <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          You are signed in as <b>{user.email}</b> (customer). Sign in with an admin account below.
        </p>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Admin email</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" required autoComplete="username" className="input pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@fpicare.in" />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" required autoComplete="current-password" className="input pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <button disabled={loading} className="btn-navy w-full py-3">
          {loading ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : <FiShield />} Login to Admin
        </button>
      </form>
      <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-rose-600"><FiArrowLeft /> Back to website</Link>
    </AdminShell>
  );
}

export function AccessDenied() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <AdminShell>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500"><FiShield size={30} /></div>
        <h1 className="mt-4 text-2xl font-extrabold">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">
          You are signed in as <b>{user?.email}</b>, which is a customer account. Please sign in with the admin account.
        </p>
        <div className="mt-8 grid gap-3">
          <button onClick={() => { logout(); nav('/admin/login'); }} className="btn-navy py-3">Switch to admin account</button>
          <Link to="/" className="btn-outline py-3">Back to website</Link>
        </div>
      </div>
    </AdminShell>
  );
}
