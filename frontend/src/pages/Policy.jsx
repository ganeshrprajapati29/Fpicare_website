import { useParams, Navigate } from 'react-router-dom';
import { PageHero, useTitle } from '../components/ui';
import { useSettings } from '../context/SettingsContext';

const POLICIES = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      ['Information we collect', 'We collect your name, contact details and delivery address only to process and deliver your orders, and to respond to your enquiries.'],
      ['How we use it', 'Your data is used for order fulfilment, customer support and (only with consent) occasional offers. We never sell your personal information.'],
      ['Discretion', 'Order contents are never disclosed on packaging. Our delivery partners receive only the information needed to deliver your parcel.'],
      ['Security', 'Passwords are encrypted and our website uses industry-standard security practices.'],
      ['Contact', 'For any privacy request, including deletion of your data, please contact us using the details below.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      ['Eligibility', 'You must be 18 years or older to purchase from FPicare.'],
      ['Product information', 'Product descriptions are for general information only and are not medical advice. Consult a doctor before using any contraceptive medicine.'],
      ['Pricing', 'All prices are in Indian Rupees and inclusive of applicable taxes. Prices may change without prior notice.'],
      ['Orders', 'We reserve the right to cancel orders in case of stock unavailability, pricing errors or suspected misuse.'],
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    body: [
      ['Delivery time', 'Orders are dispatched within 24–48 hours. Delivery typically takes 2–7 working days depending on your location.'],
      ['Shipping charges', 'Free shipping above the minimum order value shown on the website; a small fee applies below it.'],
      ['Discreet packaging', 'All orders ship in plain, unbranded packaging with no mention of the contents.'],
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    body: [
      ['Hygiene products', 'For health and hygiene reasons, opened or used intimate products cannot be returned.'],
      ['Damaged / wrong items', 'If you receive a damaged, wrong or expired product, contact us within 48 hours of delivery with photos. We will replace it or issue a full refund.'],
      ['Refund timeline', 'Approved refunds are processed within 5–7 working days to the original payment method or via UPI/bank transfer for COD orders.'],
    ],
  },
};

export default function Policy() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const p = POLICIES[slug];
  useTitle(p?.title);
  if (!p) return <Navigate to="/" replace />;
  return (
    <>
      <PageHero crumb="Policies" title={p.title} />
      <div className="container-x max-w-3xl space-y-8 py-12">
        {p.body.map(([h, t]) => (
          <div key={h}>
            <h2 className="text-lg font-bold">{h}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{t}</p>
          </div>
        ))}
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          Questions? Call {settings.phone} or email {settings.email}.
        </div>
      </div>
    </>
  );
}
