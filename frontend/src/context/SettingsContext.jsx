import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const defaults = {
  siteName: 'FPicare',
  tagline: 'Care for Every Couple',
  phone: '+91 97178 86422',
  whatsapp: '919717886422',
  email: 'support@fpicare.in',
  address: 'New Delhi, India',
  announcement: '100% Discreet Packaging • Free Delivery above ₹499 • Cash on Delivery Available',
  shippingFee: 49,
  freeShippingAbove: 499,
  heroSlides: [],
  socials: {},
};

const SettingsContext = createContext({ settings: defaults, setSettings: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings({ ...defaults, ...data })).catch(() => {});
  }, []);
  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
