import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { PageHero, SectionTitle, useTitle } from '../components/ui';

const GUIDES = [
  { t: 'Condoms', d: 'The only method that protects against both pregnancy and sexually transmitted infections (STIs). Use a new condom every time and check the expiry date.' },
  { t: 'Saheli Plus (Centchroman)', d: 'A non-hormonal, non-steroidal weekly oral contraceptive developed by CDRI, India. Usually taken twice a week for 3 months, then once a week. Always consult a doctor first.' },
  { t: 'Pregnancy test kits', d: 'Detect the hCG hormone in urine. Best used with first-morning urine from the first day of a missed period for most accurate results.' },
  { t: 'Ovulation kits', d: 'Detect the LH surge that happens 24–36 hours before ovulation, helping couples identify the most fertile days.' },
];

const FAQS = [
  ['Is the packaging really discreet?', 'Yes. Every order ships in a plain outer box or pouch with no product names or images. The sender name is a neutral business name.'],
  ['Do you offer Cash on Delivery?', 'Yes, COD is available across most pincodes in India. You can pay in cash or via UPI to the delivery partner.'],
  ['How long does delivery take?', 'Metro cities usually receive orders in 2–4 days, other locations in 4–7 working days.'],
  ['Are the products genuine?', 'Absolutely. We source only from licensed manufacturers and authorised distributors, and check expiry dates before dispatch.'],
  ['Can I return a product?', 'For hygiene reasons, opened intimate products cannot be returned. Damaged, wrong or expired items are replaced or refunded — contact us within 48 hours of delivery.'],
  ['Do I need a prescription for Saheli Plus?', 'It is available over the counter in India, but we strongly recommend consulting a doctor before starting any contraceptive pill.'],
  ['Do you supply in bulk to clinics or NGOs?', 'Yes! Use the Contact page and choose “Bulk / Wholesale” — our team will share special pricing.'],
];

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-navy-900">
        {q} <FiChevronDown className={`shrink-0 transition ${open ? 'rotate-180 text-rose-500' : ''}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</p>}
    </div>
  );
}

export default function Learn() {
  useTitle('Learn & FAQs');
  return (
    <>
      <PageHero crumb="Learn" title="Family Planning Guide & FAQs" subtitle="Simple, judgement-free information to help you choose what’s right for you." />
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Know your options" title="Quick guides" />
          <div className="grid gap-6 md:grid-cols-2">
            {GUIDES.map((g) => (
              <div key={g.t} className="card border-l-4 border-l-rose-500 p-7">
                <h3 className="text-lg font-bold">{g.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.d}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-amber-50 p-5 text-center text-sm text-amber-800">
            This information is for general awareness and is not a substitute for medical advice. Please consult a qualified doctor for guidance specific to you.
          </p>
        </div>
      </section>
      <section className="section bg-gradient-to-br from-navy-50 via-white to-rose-50">
        <div className="container-x max-w-3xl">
          <SectionTitle eyebrow="FAQs" title="Frequently asked questions" />
          <div className="space-y-3">{FAQS.map(([q, a]) => <Faq key={q} q={q} a={a} />)}</div>
          <p className="mt-10 text-center text-sm text-slate-500">Still have questions? <Link to="/contact" className="font-semibold text-rose-600">Contact us</Link></p>
        </div>
      </section>
    </>
  );
}
