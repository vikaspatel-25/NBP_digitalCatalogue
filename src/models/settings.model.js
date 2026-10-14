import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      default: '',
      trim: true
    },
    upiName: {
      type: String,
      default: '',
      trim: true
    },
    qrCode: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: ''
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
