import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  userName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  mobile: { type: String, required: true, trim: true },
  document: {
    url: { type: String, default: '' },
    public_id: { type: String, default: '' }
  },
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordUpdatedAt: { type: Date },
  passKey: { type: String, default: '' },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  isOnboarded: { type: Boolean, default: false },
  subscription: {
    plan: {
      type: String,
      enum: ['yearly_1200', 'yearly_2400', 'free_trial', 'none'],
      default: 'none'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'pending_payment', 'trial', 'inactive'],
      default: 'pending_payment'
    },
    startDate: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    lastPaymentReceivedDate: { type: Date, default: null },
    lastUtr: { type: String, default: null },
    lastPaymentRequestId: { type: String, default: null }
  },
  limits: {
    productMonthlyLimit: { type: Number, default: 25 }, // 25 for 1200, 75 for 2400
    articleMonthlyLimit: { type: Number, default: 50 },  // 50 for 1200, 150 for 2400
    maxVideoLengthSeconds: { type: Number, default: 30 },
    maxVideoSizeMb: { type: Number, default: 15 }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);