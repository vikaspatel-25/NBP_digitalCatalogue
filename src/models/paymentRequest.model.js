import mongoose from 'mongoose';

const paymentRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    userName: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    mobile: {
      type: String,
      default: '',
      trim: true
    },
    selectedPlan: {
      type: String,
      required: true
    },
    planName: {
      type: String,
      default: '',
      trim: true
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    discountedPrice: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    },
    vendorNote: {
      type: String,
      default: '',
      trim: true
    },
    // Optional legacy fields for backward compatibility
    utrNumber: {
      type: String,
      default: '',
      trim: true
    },
    screenshot: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    // Set by Admin upon approval
    approvedPlan: {
      type: String,
      default: null
    },
    paymentReceivedDate: {
      type: Date,
      default: null
    },
    durationDays: {
      type: Number,
      default: 365
    },
    activatedExpiresAt: {
      type: Date,
      default: null
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true
    },
    verifiedBy: {
      type: String,
      default: 'admin'
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'paymentRequests'
  }
);

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

export default PaymentRequest;
