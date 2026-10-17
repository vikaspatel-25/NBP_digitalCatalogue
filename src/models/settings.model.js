import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    // B2B Direct Sales Contact & Custom Enterprise Plans
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
    customPlanNote: {
      type: String,
      default: 'NetZeroMart is a dedicated B2B trade platform. Contact our sales desk for bespoke enterprise quotes, custom quotas, and corporate SLA contracts.'
    },

    // Admin-Configurable Media Upload Controls & Rate Limits
    allowImages: {
      type: Boolean,
      default: true
    },
    allowVideos: {
      type: Boolean,
      default: true
    },
    allowYoutube: {
      type: Boolean,
      default: true
    },
    maxImagesPerProduct: {
      type: Number,
      default: 10,
      min: 1,
      max: 30
    },
    maxImageSizeMb: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    maxVideosPerProduct: {
      type: Number,
      default: 2,
      min: 0,
      max: 10
    },
    maxVideoSizeMb: {
      type: Number,
      default: 15,
      min: 1,
      max: 100
    },
    maxVideoDurationSeconds: {
      type: Number,
      default: 30,
      min: 5,
      max: 300
    },
    articleMaxCoverSizeMb: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },

    // Legacy fields preserved for test / backward compatibility
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
