import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { Spinner, useTitle } from '../components/ui';
import { AuthShell } from './Login';

export default function Register() {
  useTitle('Create account');
  const { register } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      nav(params.get('next') || '/account', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Faster checkout & easy order tracking">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
        <div><label className="label">Mobile</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
        <div><label className="label">Password</label><input type="password" required minLength={6} className="input" value={form.password} onChange={set('password')} /></div>
        <button disabled={loading} className="btn-primary w-full py-3">{loading && <Spinner className="h-4 w-4 border-white/40 border-t-white" />} Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-rose-600">Login</Link></p>
    </AuthShell>
  );
}
