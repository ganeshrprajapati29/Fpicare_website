import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { inr, date } from '../../utils/format';
import { Modal, PageHeader, Table, Toggle } from '../ui';

const blank = { code: '', description: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: '', expiresAt: '', isActive: true };

export default function Coupons() {
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const load = () => api.get('/coupons').then(({ data }) => setList(data));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const { _id, createdAt, updatedAt, __v, ...body } = edit;
    body.maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : undefined;
    body.expiresAt = body.expiresAt || undefined;
    try {
      if (_id) await api.put(`/coupons/${_id}`, body);
      else await api.post('/coupons', body);
      toast.success('Saved');
      setEdit(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const del = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    await api.delete(`/coupons/${c._id}`);
    load();
  };

  if (!list) return <PageLoader />;
  return (
    <>
      <PageHeader title="Coupons" action={<button onClick={() => setEdit(blank)} className="btn-primary"><FiPlus /> New coupon</button>} />
      <Table head={['Code', 'Discount', 'Min order', 'Expires', 'Active', '']} empty={list.length ? null : 'No coupons yet'}>
        {list.map((c) => (
          <tr key={c._id} className="hover:bg-slate-50">
            <td className="px-4 py-3">
              <p className="font-mono font-bold text-rose-600">{c.code}</p>
              <p className="text-xs text-slate-400">{c.description}</p>
            </td>
            <td className="px-4 py-3">{c.type === 'percent' ? `${c.value}%` : inr(c.value)}{c.maxDiscount ? ` (max ${inr(c.maxDiscount)})` : ''}</td>
            <td className="px-4 py-3">{inr(c.minOrder)}</td>
            <td className="px-4 py-3 text-slate-500">{c.expiresAt ? date(c.expiresAt) : 'Never'}</td>
            <td className="px-4 py-3"><Toggle checked={c.isActive} onChange={async (v) => { await api.put(`/coupons/${c._id}`, { isActive: v }); load(); }} /></td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <button onClick={() => setEdit({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', maxDiscount: c.maxDiscount || '' })} className="rounded-lg p-2 text-navy-600 hover:bg-navy-50" aria-label="Edit"><FiEdit2 /></button>
                <button onClick={() => del(c)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><FiTrash2 /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?._id ? 'Edit coupon' : 'New coupon'}>
        {edit && (
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Code *</label><input required className="input uppercase" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} /></div>
            <div className="col-span-2"><label className="label">Description</label><input className="input" value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                <option value="percent">Percent %</option>
                <option value="flat">Flat ₹</option>
              </select>
            </div>
            <div><label className="label">Value *</label><input required type="number" min="0" className="input" value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} /></div>
            <div><label className="label">Min order ₹</label><input type="number" min="0" className="input" value={edit.minOrder} onChange={(e) => setEdit({ ...edit, minOrder: Number(e.target.value) })} /></div>
            <div><label className="label">Max discount ₹</label><input type="number" min="0" className="input" value={edit.maxDiscount} onChange={(e) => setEdit({ ...edit, maxDiscount: e.target.value })} /></div>
            <div className="col-span-2"><label className="label">Expires on</label><input type="date" className="input" value={edit.expiresAt} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })} /></div>
            <div className="col-span-2"><Toggle checked={edit.isActive} onChange={(v) => setEdit({ ...edit, isActive: v })} label="Active" /></div>
            <button className="btn-primary col-span-2">Save coupon</button>
          </form>
        )}
      </Modal>
    </>
  );
}
