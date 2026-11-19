import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  const s = settings.socials || {};
  const socials = [
    [s.facebook, FaFacebookF, 'Facebook'],
    [s.instagram, FaInstagram, 'Instagram'],
    [s.youtube, FaYoutube, 'YouTube'],
    [s.twitter, FaXTwitter, 'X'],
  ].filter(([u]) => u);

  return (
    <footer className="mt-10 bg-navy-900 text-navy-100">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FPicare" className="h-14 w-14 rounded-full bg-white" />
            <div>
              <p className="text-xl font-extrabold text-white">
                FP<span className="text-rose-400">icare</span>
              </p>
              <p className="font-script text-rose-200">Care for Every Couple</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-200">
            Family planning items — safe choices, hormone-free options and women's wellness, delivered discreetly across India.
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map(([url, Icon, label]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full bg-white/10 p-2.5 hover:bg-rose-500">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-rose-300" to="/shop?category=condoms">Condoms</Link></li>
            <li><Link className="hover:text-rose-300" to="/shop?category=contraceptive-pills">Contraceptive Pills</Link></li>
            <li><Link className="hover:text-rose-300" to="/shop?category=pregnancy-fertility">Pregnancy & Fertility</Link></li>
            <li><Link className="hover:text-rose-300" to="/shop?category=intimate-care">Intimate Care</Link></li>
            <li><Link className="hover:text-rose-300" to="/shop?category=combo-packs">Combo Packs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-rose-300" to="/track-order">Track Order</Link></li>
            <li><Link className="hover:text-rose-300" to="/learn">FAQs & Guides</Link></li>
            <li><Link className="hover:text-rose-300" to="/policy/shipping">Shipping Policy</Link></li>
            <li><Link className="hover:text-rose-300" to="/policy/returns">Returns & Refunds</Link></li>
            <li><Link className="hover:text-rose-300" to="/policy/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-rose-300" to="/policy/terms">Terms & Conditions</Link></li>
            <li><Link className="hover:text-rose-300" to="/admin">Admin Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><FiPhone className="mt-0.5 shrink-0 text-rose-300" /><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>
            <li className="flex gap-3"><FiMail className="mt-0.5 shrink-0 text-rose-300" /><a href={`mailto:${settings.email}`} className="break-all">{settings.email}</a></li>
            <li className="flex gap-3"><FiMapPin className="mt-0.5 shrink-0 text-rose-300" /><span>{settings.address}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-navy-200 sm:flex-row">
          <p>© {new Date().getFullYear()} FPicare. All rights reserved.</p>
          <p>Products are for adults. Consult a doctor before using any contraceptive medicine.</p>
        </div>
      </div>
    </footer>
  );
}
