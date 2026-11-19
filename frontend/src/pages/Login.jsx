import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { Spinner, useTitle } from '../components/ui';

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-navy-50 px-4 py-14">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-navy-200/50 blur-3xl" />
      <div className="card relative w-full max-w-md p-8 animate-fadeUp sm:p-10">
        <img src="/logo.png" alt="FPicare" className="mx-auto h-20 w-20 rounded-full" />
        <h1 className="mt-4 text-center text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export default function Login() {
  useTitle('Login');
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      nav(params.get('next') || (u.role === 'admin' ? '/admin' : '/account'), { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to your FPicare account">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></div>
        <div><label className="label">Password</label><input type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" /></div>
        <button disabled={loading} className="btn-primary w-full py-3">{loading && <Spinner className="h-4 w-4 border-white/40 border-t-white" />} Login</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to FPicare? <Link to={`/register${params.get('next') ? `?next=${params.get('next')}` : ''}`} className="font-semibold text-rose-600">Create an account</Link>
      </p>
    </AuthShell>
  );
}
