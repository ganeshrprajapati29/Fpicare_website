import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import api, { errMsg } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { date } from '../../utils/format';
import { PageHeader, Table, Toggle } from '../ui';

export default function Users() {
  const { user: me } = useAuth();
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const load = () => api.get('/admin/users', { params: { q: q || undefined } }).then(({ data }) => setList(data));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const patch = async (u, body) => {
    try {
      await api.put(`/admin/users/${u._id}`, body);
      toast.success('Updated');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <>
      <PageHeader title="Customers" subtitle={list ? `${list.length} accounts` : ''} />
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or phone…" className="input pl-10" />
      </form>
      {!list ? (
        <PageLoader />
      ) : (
        <Table head={['Name', 'Email', 'Phone', 'Joined', 'Role', 'Active']} empty={list.length ? null : 'No customers yet'}>
          {list.map((u) => (
            <tr key={u._id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-navy-900">{u.name}</td>
              <td className="px-4 py-3 text-slate-600">{u.email}</td>
              <td className="px-4 py-3 text-slate-600">{u.phone || '—'}</td>
              <td className="px-4 py-3 text-slate-500">{date(u.createdAt)}</td>
              <td className="px-4 py-3">
                <select disabled={u._id === me._id} value={u.role} onChange={(e) => patch(u, { role: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="px-4 py-3">{u._id !== me._id && <Toggle checked={u.isActive} onChange={(v) => patch(u, { isActive: v })} />}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
