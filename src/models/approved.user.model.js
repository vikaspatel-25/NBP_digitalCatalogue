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
      enum: ['free_trial', 'monthly_28d', 'yearly_365d', 'none'],
      default: 'free_trial'
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'expired', 'inactive'],
      default: 'trial'
    },
    trialAvailed: { type: Boolean, default: false },
    startDate: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
    },
    lastOrderId: { type: String, default: null },
    lastPaymentId: { type: String, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);