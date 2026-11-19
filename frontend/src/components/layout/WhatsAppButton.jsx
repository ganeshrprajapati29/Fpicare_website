import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  if (!settings.whatsapp) return null;
  const href = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi FPicare, I need help with a product.')}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="pulse-ring fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110"
    >
      <FaWhatsapp size={30} />
    </a>
  );
}
