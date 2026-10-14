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
      enum: ['yearly_1200', 'yearly_2400'],
      required: true
    },
    amount: {
      type: Number,
      required: true // 1200 or 2400
    },
    utrNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
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
      enum: ['yearly_1200', 'yearly_2400', null],
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
