import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiPhone, FiMail } from 'react-icons/fi';
import api, { errMsg } from '../../api/client';
import { Empty, PageLoader } from '../../components/ui';
import { date } from '../../utils/format';
import { PageHeader, Panel } from '../ui';

const TONE = { new: 'bg-rose-50 text-rose-600', read: 'bg-sky-50 text-sky-700', resolved: 'bg-emerald-50 text-emerald-700' };

export default function Enquiries() {
  const [list, setList] = useState(null);
  const load = () => api.get('/enquiries').then(({ data }) => setList(data));
  useEffect(() => {
    load();
  }, []);
  const setStatus = async (e, status) => {
    try {
      await api.put(`/enquiries/${e._id}`, { status });
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const del = async (e) => {
    if (!window.confirm('Delete this enquiry?')) return;
    await api.delete(`/enquiries/${e._id}`);
    load();
  };
  if (!list) return <PageLoader />;
  return (
    <>
      <PageHeader title="Enquiries" subtitle="Messages from the contact form" />
      {list.length === 0 ? (
        <Empty title="No enquiries yet" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((e) => (
            <Panel key={e._id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-navy-900">{e.name}</p>
                  <p className="text-xs text-slate-500">{date(e.createdAt, true)} · <span className="capitalize">{e.type}</span></p>
                </div>
                <span className={`badge px-3 py-1 capitalize ${TONE[e.status]}`}>{e.status}</span>
              </div>
              {e.subject && <p className="mt-3 text-sm font-semibold">{e.subject}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{e.message}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                {e.phone && <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-rose-600"><FiPhone /> {e.phone}</a>}
                {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-rose-600"><FiMail /> {e.email}</a>}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                {['new', 'read', 'resolved'].map((s) => (
                  <button key={s} onClick={() => setStatus(e, s)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${e.status === s ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'}`}>{s}</button>
                ))}
                <button onClick={() => del(e)} className="ml-auto rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><FiTrash2 /></button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
