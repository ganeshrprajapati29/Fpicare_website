import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    siteName: { type: String, default: 'FPicare' },
    tagline: { type: String, default: 'Care for Every Couple' },
    phone: { type: String, default: '+91 97178 86422' },
    whatsapp: { type: String, default: '919717886422' },
    email: { type: String, default: 'support@fpicare.in' },
    address: { type: String, default: 'New Delhi, India' },
    announcement: { type: String, default: '100% Discreet Packaging • Free Delivery above ₹499 • Cash on Delivery Available' },
    shippingFee: { type: Number, default: 49 },
    freeShippingAbove: { type: Number, default: 499 },
    codEnabled: { type: Boolean, default: true },
    heroSlides: [
      {
        title: String,
        subtitle: String,
        image: String,
        ctaText: String,
        ctaLink: String,
      },
    ],
    socials: {
      facebook: String,
      instagram: String,
      youtube: String,
      twitter: String,
    },
  },
  { timestamps: true }
);

settingSchema.statics.getSite = async function getSite() {
  let s = await this.findOne({ key: 'site' });
  if (!s) s = await this.create({ key: 'site' });
  return s;
};

export default mongoose.model('Setting', settingSchema);
