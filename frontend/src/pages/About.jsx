import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLeaf, FaHeartbeat, FaUsers, FaHandsHelping, FaUserLock } from 'react-icons/fa';
import { PageHero, SectionTitle, useTitle } from '../components/ui';

export default function About() {
  useTitle('About Us');
  return (
    <>
      <PageHero crumb="About us" title="Care for Every Couple" subtitle="FPicare makes family planning simple, private and accessible for every household in India." />
      <section className="section">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 rounded-full bg-brand opacity-20 blur-3xl" />
            <img src="/logo.png" alt="FPicare" className="relative w-full rounded-full shadow-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Our story</p>
            <h2 className="mt-2 text-3xl font-extrabold">Family planning without hesitation</h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              Buying contraceptives and intimate wellness products is still awkward for many people. FPicare was started to change that — by
              bringing genuine, affordable family planning items online with honest information and completely discreet delivery.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              From trusted condoms and hormone-free options like Saheli Plus to pregnancy tests and women's wellness products, we curate every
              item carefully so couples can make informed, confident choices.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[['100%', 'Discreet packing'], ['COD', 'Available'], ['Pan-India', 'Delivery']].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-xl font-extrabold text-rose-600">{n}</p>
                  <p className="text-xs text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-gradient-to-br from-navy-50 via-white to-rose-50">
        <div className="container-x">
          <SectionTitle eyebrow="Our values" title="What we stand for" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [FaShieldAlt, 'Safe Choices', 'Only genuine products from licensed manufacturers and distributors.'],
              [FaLeaf, 'Hormone-free Options', 'Making non-hormonal contraception easier to discover and access.'],
              [FaHeartbeat, "Women's Wellness", 'Products and information that put women’s health first.'],
              [FaUserLock, 'Privacy First', 'Plain packaging, secure data and no awkward questions.'],
              [FaUsers, 'For Every Couple', 'Fair pricing so family planning is affordable for everyone.'],
              [FaHandsHelping, 'Community', 'Supporting NGOs, clinics and health camps with bulk supply.'],
            ].map(([Icon, t, d]) => (
              <div key={t} className="card p-7">
                <div className="inline-flex rounded-2xl bg-brand p-3.5 text-white"><Icon size={22} /></div>
                <h3 className="mt-4 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-sm text-slate-500">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center"><Link to="/shop" className="btn-primary px-8 py-3">Explore products</Link></div>
        </div>
      </section>
    </>
  );
}
