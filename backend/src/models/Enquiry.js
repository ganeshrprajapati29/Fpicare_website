import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    subject: String,
    message: { type: String, required: true },
    type: { type: String, enum: ['general', 'bulk', 'distributor', 'support'], default: 'general' },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', enquirySchema);
