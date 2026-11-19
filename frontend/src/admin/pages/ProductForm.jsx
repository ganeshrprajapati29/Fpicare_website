import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api, { errMsg } from '../../api/client';
import { PageLoader, Spinner } from '../../components/ui';
import { ImageUploader, PageHeader, Panel, Toggle } from '../ui';

const empty = {
  name: '', brand: 'FPicare', category: '', shortDescription: '', description: '', howToUse: '',
  features: '', tags: '', images: [], price: '', mrp: '', stock: 0, sku: '', packSize: '',
  hormoneFree: false, isFeatured: false, isBestSeller: false, isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(id ? null : empty);
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories', { params: { all: 1 } }).then(({ data }) => setCats(data));
    if (id) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({ ...empty, ...p, category: p.category?._id || '', features: (p.features || []).join('\n'), tags: (p.tags || []).join(', ') });
      });
    }
  }, [id]);

  if (!form) return <PageLoader />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      stock: Number(form.stock),
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
    };
    ['_id', 'slug', 'reviews', 'rating', 'numReviews', 'createdAt', 'updatedAt', '__v', 'sold', 'discountPercent', 'id'].forEach((k) => delete body[k]);
    try {
      if (id) await api.put(`/products/${id}`, body);
      else await api.post('/products', body);
      toast.success(id ? 'Product updated' : 'Product created');
      nav('/admin/products');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title={id ? 'Edit product' : 'Add product'}
        action={
          <div className="flex gap-2">
            <Link to="/admin/products" className="btn-outline"><FiArrowLeft /> Back</Link>
            <button disabled={saving} className="btn-primary">{saving ? <Spinner className="h-4 w-4" /> : <FiSave />} Save</button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Product name *</label><input required className="input" value={form.name} onChange={set('name')} /></div>
            <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={set('brand')} /></div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={set('category')}>
                <option value="">— None —</option>
                {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="label">Short description</label><input className="input" value={form.shortDescription} onChange={set('shortDescription')} /></div>
            <div className="sm:col-span-2"><label className="label">Full description</label><textarea rows={5} className="input" value={form.description} onChange={set('description')} /></div>
            <div className="sm:col-span-2"><label className="label">How to use</label><textarea rows={3} className="input" value={form.howToUse} onChange={set('howToUse')} /></div>
            <div><label className="label">Key features (one per line)</label><textarea rows={4} className="input" value={form.features} onChange={set('features')} /></div>
            <div><label className="label">Search tags (comma separated)</label><textarea rows={4} className="input" value={form.tags} onChange={set('tags')} /></div>
          </Panel>
          <Panel className="p-6">
            <label className="label">Images (first image is the main image)</label>
            <ImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel className="grid grid-cols-2 gap-4 p-6">
            <div><label className="label">Price (₹) *</label><input required type="number" min="0" className="input" value={form.price} onChange={set('price')} /></div>
            <div><label className="label">MRP (₹)</label><input type="number" min="0" className="input" value={form.mrp || ''} onChange={set('mrp')} /></div>
            <div><label className="label">Stock</label><input type="number" min="0" className="input" value={form.stock} onChange={set('stock')} /></div>
            <div><label className="label">Pack size</label><input className="input" value={form.packSize} onChange={set('packSize')} placeholder="10 Condoms" /></div>
            <div className="col-span-2"><label className="label">SKU</label><input className="input" value={form.sku} onChange={set('sku')} /></div>
          </Panel>
          <Panel className="space-y-4 p-6">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Visible on website" />
            <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="Featured on homepage" />
            <Toggle checked={form.isBestSeller} onChange={(v) => setForm({ ...form, isBestSeller: v })} label="Bestseller badge" />
            <Toggle checked={form.hormoneFree} onChange={(v) => setForm({ ...form, hormoneFree: v })} label="Hormone-free" />
          </Panel>
        </div>
      </div>
    </form>
  );
}
