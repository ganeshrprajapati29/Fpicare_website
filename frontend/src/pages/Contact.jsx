import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api, { errMsg } from '../api/client';
import { useSettings } from '../context/SettingsContext';
import { PageHero, Spinner, useTitle } from '../components/ui';

export default function Contact() {
  useTitle('Contact Us');
  const { settings } = useSettings();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '', type: params.get('type') || 'general' });
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post('/enquiries', form);
      toast.success(data.message);
      setForm({ name: '', phone: '', email: '', subject: '', message: '', type: 'general' });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  const cards = [
    [FiPhone, 'Call us', settings.phone, `tel:${settings.phone}`],
    [FaWhatsapp, 'WhatsApp', 'Chat with us', `https://wa.me/${(settings.whatsapp || '').replace(/\D/g, '')}`],
    [FiMail, 'Email', settings.email, `mailto:${settings.email}`],
    [FiMapPin, 'Address', settings.address, null],
  ];

  return (
    <>
      <PageHero crumb="Contact" title="We're here to help" subtitle="Questions about a product, order or bulk supply? Reach out — we reply quickly and confidentially." />
      <div className="container-x grid gap-8 py-12 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {cards.map(([Icon, t, v, href]) => {
            const inner = (
              <>
                <div className="rounded-2xl bg-rose-50 p-3.5 text-rose-500"><Icon size={20} /></div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t}</p>
                  <p className="break-words font-semibold text-navy-900">{v}</p>
                </div>
              </>
            );
            return href ? (
              <a key={t} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-xl">{inner}</a>
            ) : (
              <div key={t} className="card flex items-center gap-4 p-5">{inner}</div>
            );
          })}
        </div>
        <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:col-span-3">
          <h3 className="text-xl font-bold sm:col-span-2">Send us a message</h3>
          <div><label className="label">Name *</label><input required className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Mobile</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={set('email')} /></div>
          <div>
            <label className="label">Enquiry type</label>
            <select className="input" value={form.type} onChange={set('type')}>
              <option value="general">General</option>
              <option value="support">Order support</option>
              <option value="bulk">Bulk / Wholesale</option>
              <option value="distributor">Become a distributor</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Subject</label><input className="input" value={form.subject} onChange={set('subject')} /></div>
          <div className="sm:col-span-2"><label className="label">Message *</label><textarea required rows={5} className="input" value={form.message} onChange={set('message')} /></div>
          <div className="sm:col-span-2">
            <button disabled={sending} className="btn-primary px-8 py-3">{sending ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : <FiSend />} Send message</button>
            <p className="mt-2 text-xs text-slate-400">Please share a mobile number or email so we can reply.</p>
          </div>
        </form>
      </div>
    </>
  );
}
