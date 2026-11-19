import mongoose from 'mongoose';

export const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number,
        qty: { type: Number, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
    itemsTotal: Number,
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: Number,
    discreetPackaging: { type: Boolean, default: true },
    notes: String,
    trackingId: String,
    courier: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
