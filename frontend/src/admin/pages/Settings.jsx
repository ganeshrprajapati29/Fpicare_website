import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import api, { errMsg } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';
import { ImageUploader, PageHeader, Panel, Toggle } from '../ui';

export default function Settings() {
  const { setSettings } = useSettings();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get('/settings').then(({ data }) => setS({ ...data, socials: data.socials || {}, heroSlides: data.heroSlides || [] }));
  }, []);
  if (!s) return <PageLoader />;

  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setSocial = (k) => (e) => setS({ ...s, socials: { ...s.socials, [k]: e.target.value } });
  const setSlide = (i, k, v) => setS({ ...s, heroSlides: s.heroSlides.map((sl, j) => (j === i ? { ...sl, [k]: v } : sl)) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/settings', { ...s, shippingFee: Number(s.shippingFee), freeShippingAbove: Number(s.freeShippingAbove) });
      setSettings((prev) => ({ ...prev, ...data }));
      toast.success('Settings saved');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader title="Store settings" action={<button disabled={saving} className="btn-primary"><FiSave /> Save settings</button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="grid gap-4 p-6 sm:grid-cols-2">
          <h3 className="font-bold sm:col-span-2">Business details</h3>
          <div><label className="label">Store name</label><input className="input" value={s.siteName} onChange={set('siteName')} /></div>
          <div><label className="label">Tagline</label><input className="input" value={s.tagline} onChange={set('tagline')} /></div>
          <div><label className="label">Phone</label><input className="input" value={s.phone} onChange={set('phone')} /></div>
          <div><label className="label">WhatsApp (with country code)</label><input className="input" value={s.whatsapp} onChange={set('whatsapp')} placeholder="919717886422" /></div>
          <div className="sm:col-span-2"><label className="label">Email</label><input className="input" value={s.email} onChange={set('email')} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><textarea rows={2} className="input" value={s.address} onChange={set('address')} /></div>
          <div className="sm:col-span-2"><label className="label">Announcement bar</label><input className="input" value={s.announcement} onChange={set('announcement')} /></div>
        </Panel>
        <div className="space-y-6">
          <Panel className="grid gap-4 p-6 sm:grid-cols-2">
            <h3 className="font-bold sm:col-span-2">Shipping & payment</h3>
            <div><label className="label">Shipping fee ₹</label><input type="number" min="0" className="input" value={s.shippingFee} onChange={set('shippingFee')} /></div>
            <div><label className="label">Free shipping above ₹</label><input type="number" min="0" className="input" value={s.freeShippingAbove} onChange={set('freeShippingAbove')} /></div>
            <div className="sm:col-span-2"><Toggle checked={s.codEnabled} onChange={(v) => setS({ ...s, codEnabled: v })} label="Cash on Delivery enabled" /></div>
          </Panel>
          <Panel className="grid gap-4 p-6 sm:grid-cols-2">
            <h3 className="font-bold sm:col-span-2">Social links</h3>
            {['facebook', 'instagram', 'youtube', 'twitter'].map((k) => (
              <div key={k}><label className="label capitalize">{k}</label><input className="input" value={s.socials[k] || ''} onChange={setSocial(k)} placeholder="https://" /></div>
            ))}
          </Panel>
        </div>
      </div>

      <Panel className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Homepage hero slides</h3>
          <button type="button" onClick={() => setS({ ...s, heroSlides: [...s.heroSlides, { title: '', subtitle: '', image: '', ctaText: 'Shop Now', ctaLink: '/shop' }] })} className="btn-outline"><FiPlus /> Add slide</button>
        </div>
        <div className="space-y-4">
          {s.heroSlides.map((sl, i) => (
            <div key={i} className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[auto_1fr]">
              <ImageUploader multiple={false} value={sl.image ? [sl.image] : []} onChange={(arr) => setSlide(i, 'image', arr[0] || '')} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="label">Title</label><input className="input" value={sl.title} onChange={(e) => setSlide(i, 'title', e.target.value)} /></div>
                <div className="sm:col-span-2"><label className="label">Subtitle</label><input className="input" value={sl.subtitle} onChange={(e) => setSlide(i, 'subtitle', e.target.value)} /></div>
                <div><label className="label">Button text</label><input className="input" value={sl.ctaText} onChange={(e) => setSlide(i, 'ctaText', e.target.value)} /></div>
                <div className="flex gap-2">
                  <div className="flex-1"><label className="label">Button link</label><input className="input" value={sl.ctaLink} onChange={(e) => setSlide(i, 'ctaLink', e.target.value)} /></div>
                  <button type="button" onClick={() => setS({ ...s, heroSlides: s.heroSlides.filter((_, j) => j !== i) })} className="mt-6 rounded-lg p-2.5 text-red-500 hover:bg-red-50" aria-label="Remove slide"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </form>
  );
}
