import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy-800 shadow-lg ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:bg-rose-500 hover:text-white ${show ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      <FiArrowUp />
    </button>
  );
}
