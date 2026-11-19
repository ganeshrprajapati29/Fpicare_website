import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { Modal, PageHeader, Table, Toggle } from '../ui';

const ICONS = ['shield', 'pill', 'baby', 'drop', 'heart', 'gift'];
const blank = { name: '', description: '', icon: 'heart', sortOrder: 0, isActive: true };

export default function Categories() {
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const load = () => api.get('/categories', { params: { all: 1 } }).then(({ data }) => setList(data));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { _id, productCount, createdAt, updatedAt, __v, slug, ...body } = edit;
      if (_id) await api.put(`/categories/${_id}`, body);
      else await api.post('/categories', body);
      toast.success('Saved');
      setEdit(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const del = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (!list) return <PageLoader />;
  return (
    <>
      <PageHeader title="Categories" action={<button onClick={() => setEdit(blank)} className="btn-primary"><FiPlus /> Add category</button>} />
      <Table head={['Name', 'Slug', 'Products', 'Order', 'Active', '']} empty={list.length ? null : 'No categories yet'}>
        {list.map((c) => (
          <tr key={c._id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold text-navy-900">{c.name}</td>
            <td className="px-4 py-3 text-slate-500">{c.slug}</td>
            <td className="px-4 py-3">{c.productCount}</td>
            <td className="px-4 py-3">{c.sortOrder}</td>
            <td className="px-4 py-3">
              <Toggle checked={c.isActive} onChange={async (v) => { await api.put(`/categories/${c._id}`, { isActive: v }); load(); }} />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <button onClick={() => setEdit(c)} className="rounded-lg p-2 text-navy-600 hover:bg-navy-50" aria-label="Edit"><FiEdit2 /></button>
                <button onClick={() => del(c)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><FiTrash2 /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?._id ? 'Edit category' : 'New category'}>
        {edit && (
          <form onSubmit={save} className="space-y-4">
            <div><label className="label">Name *</label><input required className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div><label className="label">Description</label><textarea rows={3} className="input" value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Icon</label>
                <select className="input" value={edit.icon || 'heart'} onChange={(e) => setEdit({ ...edit, icon: e.target.value })}>
                  {ICONS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div><label className="label">Sort order</label><input type="number" className="input" value={edit.sortOrder} onChange={(e) => setEdit({ ...edit, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <Toggle checked={edit.isActive} onChange={(v) => setEdit({ ...edit, isActive: v })} label="Active" />
            <button className="btn-primary w-full">Save</button>
          </form>
        )}
      </Modal>
    </>
  );
}
