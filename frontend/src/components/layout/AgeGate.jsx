import { useState } from 'react';

const KEY = 'fpc_age_ok';

export default function AgeGate() {
  const [ok, setOk] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return true;
    }
  });
  if (ok) return null;
  const accept = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setOk(true);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl animate-fadeUp">
        <img src="/logo.png" alt="FPicare" className="mx-auto h-24 w-24 rounded-full" />
        <h3 className="mt-4 text-xl font-extrabold">Are you 18 or older?</h3>
        <p className="mt-2 text-sm text-slate-500">
          This website offers family planning & intimate wellness products intended for adults.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a href="https://www.google.com" className="btn-outline">No, exit</a>
          <button onClick={accept} className="btn-primary">Yes, I am 18+</button>
        </div>
      </div>
    </div>
  );
}
