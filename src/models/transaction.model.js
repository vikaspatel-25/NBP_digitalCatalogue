import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    companyName: {
      type: String,
      default: ''
    },
    planType: {
      type: String,
      enum: ['monthly_28d', 'yearly_365d'],
      required: true
    },
    amount: {
      type: Number, // in paise (e.g. 4900 for ₹49, 49900 for ₹499)
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    paymentId: {
      type: String,
      default: null,
      index: true
    },
    signature: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
      index: true
    },
    method: {
      type: String, // 'upi', 'card', 'netbanking', etc.
      default: 'upi'
    },
    daysAdded: {
      type: Number,
      required: true
    },
    previousExpiresAt: {
      type: Date,
      default: null
    },
    newExpiresAt: {
      type: Date,
      default: null
    },
    rawWebhookEvent: {
      type: Object,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
