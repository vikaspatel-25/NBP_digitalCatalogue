import Product from '../models/product.model.js';
import Article from '../models/article.model.js';
import ApprovedUser from '../models/approved.user.model.js';
import User from '../models/user.model.js';

/**
 * Returns the start of the current month in UTC
 */
function getStartOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Helper to fetch vendor details
 */
async function getVendorUser(userId) {
  let vendor = await ApprovedUser.findById(userId);
  if (!vendor) {
    vendor = await User.findById(userId);
  }
  return vendor;
}

/**
 * Checks if vendor has exceeded monthly product upload quota or active subscription
 */
export async function checkProductUploadQuota(userId) {
  if (!userId) return { allowed: true }; // Admin bypass

  const vendor = await getVendorUser(userId);
  if (!vendor) return { allowed: false, error: 'Vendor profile not found' };

  // 1. Subscription active check
  const now = new Date();
  const sub = vendor.subscription || {};
  const isSubscriptionActive = sub.status === 'active' && sub.expiresAt && new Date(sub.expiresAt) > now;

  if (!isSubscriptionActive) {
    return {
      allowed: false,
      error: 'Your annual subscription is not active or has expired. Please submit your renewal payment to upload products.'
    };
  }

  // 2. Monthly limit check (25 for Standard 1200, 75 for Enterprise 2400)
  const isPro = sub.plan === 'yearly_2400';
  const monthlyLimit = vendor.limits?.productMonthlyLimit || (isPro ? 75 : 25);

  const startOfMonth = getStartOfCurrentMonth();
  const currentMonthCount = await Product.countDocuments({
    $or: [
      { creatorId: String(vendor.userId || vendor._id) },
      { email: vendor.email?.toLowerCase().trim() }
    ],
    createdAt: { $gte: startOfMonth }
  });

  if (currentMonthCount >= monthlyLimit) {
    return {
      allowed: false,
      error: `Monthly product limit reached (${currentMonthCount}/${monthlyLimit} products used this month). Your limit resets on the 1st of next month.${!isPro ? ' Upgrade your plan for higher monthly limits.' : ''}`
    };
  }

  return {
    allowed: true,
    currentMonthCount,
    monthlyLimit,
    maxVideoLengthSeconds: vendor.limits?.maxVideoLengthSeconds || 30,
    maxVideoSizeMb: vendor.limits?.maxVideoSizeMb || 15
  };
}

/**
 * Checks if vendor has exceeded monthly article quota or active subscription
 */
export async function checkArticleUploadQuota(userId) {
  if (!userId) return { allowed: true }; // Admin bypass

  const vendor = await getVendorUser(userId);
  if (!vendor) return { allowed: false, error: 'Vendor profile not found' };

  // 1. Subscription active check
  const now = new Date();
  const sub = vendor.subscription || {};
  const isSubscriptionActive = sub.status === 'active' && sub.expiresAt && new Date(sub.expiresAt) > now;

  if (!isSubscriptionActive) {
    return {
      allowed: false,
      error: 'Your annual subscription is not active or has expired. Please submit your renewal payment to publish articles.'
    };
  }

  // 2. Monthly limit check (50 for Standard 1200, 150 for Enterprise 2400)
  const isPro = sub.plan === 'yearly_2400';
  const monthlyLimit = vendor.limits?.articleMonthlyLimit || (isPro ? 150 : 50);

  const startOfMonth = getStartOfCurrentMonth();
  const currentMonthCount = await Article.countDocuments({
    $or: [
      { creatorId: String(vendor.userId || vendor._id) },
      { email: vendor.email?.toLowerCase().trim() }
    ],
    createdAt: { $gte: startOfMonth }
  });

  if (currentMonthCount >= monthlyLimit) {
    return {
      allowed: false,
      error: `Monthly article limit reached (${currentMonthCount}/${monthlyLimit} articles used this month). Your quota resets on the 1st of next month.${!isPro ? ' Upgrade your plan for higher monthly limits.' : ''}`
    };
  }

  return {
    allowed: true,
    currentMonthCount,
    monthlyLimit
  };
}
