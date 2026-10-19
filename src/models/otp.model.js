import mongoose from 'mongoose';
import crypto from 'node:crypto';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    purpose: {
      type: String,
      enum: ['admin_login', 'vendor_registration'],
      required: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '15m' } // TTL index automatically cleans up expired documents
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'otpVerifications'
  }
);

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
otpSchema.statics.generateCode = function () {
  return crypto.randomInt(100000, 1000000).toString();
};

const OtpVerification = mongoose.model('OtpVerification', otpSchema);

export default OtpVerification;
