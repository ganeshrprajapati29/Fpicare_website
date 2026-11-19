import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import api, { errMsg, imgUrl } from '../api/client';
import { Spinner } from '../components/ui';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}

export function Table({ head, children, empty }) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      {empty && <p className="p-10 text-center text-sm text-slate-400">{empty}</p>}
    </Panel>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/50 p-0 sm:items-center sm:p-4">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 animate-fadeUp sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close"><FiX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-rose-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <input type="checkbox" className="sr-only" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function ImageUploader({ value = [], onChange, multiple = true }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const upload = async (files) => {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append('images', f));
    setBusy(true);
    try {
      const { data } = await api.post('/upload', fd);
      onChange(multiple ? [...value, ...data.urls] : data.urls.slice(0, 1));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
      ref.current.value = '';
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={src + i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img src={imgUrl(src)} alt="" className="h-full w-full object-contain" />
            {i === 0 && multiple && <span className="absolute bottom-1 left-1 rounded bg-navy-800 px-1.5 text-[10px] text-white">Main</span>}
            <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500 shadow" aria-label="Remove image">
              <FiX size={12} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => ref.current.click()} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-rose-400 hover:text-rose-500">
          {busy ? <Spinner className="h-5 w-5" /> : <FiUploadCloud size={22} />} Upload
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
    </div>
  );
}
