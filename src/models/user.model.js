import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String },
    document: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" }
    },
    userId: { type: String },
    password: { type: String },
    passKey: { type: String },
    role: { type: String, default: "user" },
    status: { type: String, default: "active" },
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
      productMonthlyLimit: { type: Number, default: 25 },
      articleMonthlyLimit: { type: Number, default: 50 },
      maxVideoLengthSeconds: { type: Number, default: 30 },
      maxVideoSizeMb: { type: Number, default: 15 }
    },

    passwordUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema, "users");