import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      default: 'netzeromart@upi',
      trim: true
    },
    upiName: {
      type: String,
      default: 'NetZeroMart Official',
      trim: true
    },
    qrCode: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    contactEmail: {
      type: String,
      default: 'netzeromart@gmail.com',
      trim: true
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: 'Please enter your UPI transaction / UTR reference number and upload payment proof for verification.'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'platformSettings' }
);

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;
