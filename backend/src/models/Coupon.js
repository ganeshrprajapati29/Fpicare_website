import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: Number,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.computeDiscount = function computeDiscount(subtotal) {
  if (!this.isActive) throw new Error('Coupon is not active');
  if (this.expiresAt && this.expiresAt < new Date()) throw new Error('Coupon has expired');
  if (subtotal < this.minOrder) throw new Error(`Minimum order of ₹${this.minOrder} required`);
  let d = this.type === 'percent' ? (subtotal * this.value) / 100 : this.value;
  if (this.maxDiscount) d = Math.min(d, this.maxDiscount);
  return Math.min(Math.round(d), subtotal);
};

export default mongoose.model('Coupon', couponSchema);
