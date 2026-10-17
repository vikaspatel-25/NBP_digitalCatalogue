import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 1800
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 1200
    },
    discountPercentage: {
      type: Number,
      default: 0
    },
    billingCycle: {
      type: String,
      default: 'Per Year',
      trim: true
    },
    badge: {
      type: String,
      default: '',
      trim: true
    },
    productMonthlyLimit: {
      type: Number,
      required: true,
      default: 25
    },
    articleMonthlyLimit: {
      type: Number,
      required: true,
      default: 50
    },
    maxVideosPerProduct: {
      type: Number,
      default: 1
    },
    maxVideoSizeMb: {
      type: Number,
      default: 15
    },
    features: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'subscriptionPlans'
  }
);

// Pre-save hook to calculate percentage off
subscriptionPlanSchema.pre('save', function (next) {
  if (this.originalPrice > 0 && this.discountedPrice !== undefined) {
    if (this.originalPrice > this.discountedPrice) {
      this.discountPercentage = Math.round(
        ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
      );
    } else {
      this.discountPercentage = 0;
    }
  } else {
    this.discountPercentage = 0;
  }
  if (typeof next === 'function') next();
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;

/**
 * Default starter plans to ensure seamless out-of-the-box operation
 */
export const DEFAULT_PLANS = [
  {
    planId: 'yearly_1200',
    name: 'Standard Annual Plan',
    originalPrice: 1800,
    discountedPrice: 1200,
    discountPercentage: 33,
    billingCycle: 'Per Year',
    badge: 'Popular Choice',
    productMonthlyLimit: 25,
    articleMonthlyLimit: 50,
    maxVideosPerProduct: 1,
    maxVideoSizeMb: 15,
    features: [
      '25 Products / month upload quota',
      '50 Articles / month publishing quota',
      'Full Digital Catalogue storefront exposure',
      'Images + Short video clip (≤30s / 15MB)',
      'Unlimited YouTube embed links',
      'Direct Buyer Lead Inquiries'
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    planId: 'yearly_2400',
    name: 'Enterprise Annual Plan',
    originalPrice: 3600,
    discountedPrice: 2400,
    discountPercentage: 33,
    billingCycle: 'Per Year (High Volume)',
    badge: '3x Volume Limit',
    productMonthlyLimit: 75,
    articleMonthlyLimit: 150,
    maxVideosPerProduct: 2,
    maxVideoSizeMb: 15,
    features: [
      '75 Products / month upload quota (3x limit)',
      '150 Articles / month publishing quota (3x limit)',
      'Priority placement in catalogue directories',
      'Images + Up to 2 Short video clips (≤30s / 15MB)',
      'Unlimited YouTube embed links',
      'Dedicated Partner Support'
    ],
    isActive: true,
    sortOrder: 2
  }
];
