import { useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

export function Spinner({ className = 'h-6 w-6' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-rose-200 border-t-rose-500 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <img src="/logo.png" alt="" className="h-16 w-16 animate-pulse rounded-full" />
        <Spinner />
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`mb-10 ${center ? 'mx-auto max-w-2xl text-center' : ''}`}>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-500">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) =>
        value >= i ? <FaStar key={i} size={size} /> : value >= i - 0.5 ? <FaStarHalfAlt key={i} size={size} /> : <FaRegStar key={i} size={size} />
      )}
    </span>
  );
}

export function Empty({ icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
      {icon && <div className="mb-4 rounded-full bg-rose-50 p-5 text-3xl text-rose-500">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | FPicare` : 'FPicare – Family Planning Items | Care for Every Couple';
  }, [title]);
}

export function PageHero({ title, subtitle, crumb }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-navy-50">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-navy-200/40 blur-3xl" />
      <div className="container-x relative py-12 sm:py-16">
        {crumb && <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">{crumb}</p>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-slate-500">{subtitle}</p>}
      </div>
    </section>
  );
}
