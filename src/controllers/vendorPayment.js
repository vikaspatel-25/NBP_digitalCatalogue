import path from 'path';
import { fileURLToPath } from 'url';
import PlatformSettings from '../models/settings.model.js';
import PaymentRequest from '../models/paymentRequest.model.js';
import SubscriptionPlan from '../models/plan.model.js';
import ApprovedUser from '../models/approved.user.model.js';
import User from '../models/user.model.js';
import { getOrCreateSettings, getOrSeedPlans } from './adminPayment.js';
import { sendManualPaymentSubmittedEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactIndexPath = path.resolve(process.cwd(), 'frontend/dist/index.html');

/**
 * Fallback static plans config for legacy compatibility
 */
export const PLANS_CONFIG = {
  yearly_1200: {
    id: 'yearly_1200',
    planId: 'yearly_1200',
    name: 'Standard Annual Plan',
    originalPrice: 1800,
    price: 1200,
    discountedPrice: 1200,
    discountPercentage: 33,
    displayPrice: '₹1,200',
    billingCycle: 'Per Year',
    badge: 'Popular Choice',
    productMonthlyLimit: 25,
    articleMonthlyLimit: 50,
    features: [
      '25 Products / month upload quota',
      '50 Articles / month publishing quota',
      'Full Digital Catalogue exposure',
      'Images + Short video clip (≤30s / 15MB)',
      'Unlimited YouTube embed links',
      'Direct Buyer Lead Inquiries'
    ]
  },
  yearly_2400: {
    id: 'yearly_2400',
    planId: 'yearly_2400',
    name: 'Enterprise Annual Plan',
    originalPrice: 3600,
    price: 2400,
    discountedPrice: 2400,
    discountPercentage: 33,
    displayPrice: '₹2,400',
    billingCycle: 'Per Year (High Volume)',
    badge: '3x Volume Limit',
    productMonthlyLimit: 75,
    articleMonthlyLimit: 150,
    features: [
      '75 Products / month upload quota (3x limit)',
      '150 Articles / month publishing quota (3x limit)',
      'Priority placement in catalogue directories',
      'Images + Up to 2 Short video clips (≤30s / 15MB)',
      'Unlimited YouTube embed links',
      'Dedicated Partner Support'
    ]
  }
};

/**
 * Helper to find vendor across models
 */
async function findVendorById(userId) {
  let vendor = await ApprovedUser.findById(userId);
  if (!vendor) {
    vendor = await User.findById(userId);
  }
  return vendor;
}

/**
 * GET /api/userPanel/payment-info
 * Returns active subscription plans with dynamic pricing and % discount,
 * vendor status, and B2B sales contact info for custom packages.
 */
export async function getVendorPaymentInfo(req, res) {
  try {
    const settings = await getOrCreateSettings();
    const vendor = await findVendorById(req.user?._id);

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Dynamic Plans from Database
    const allDbPlans = await getOrSeedPlans();
    const activePlans = allDbPlans.filter(p => p.isActive !== false);

    // Build dictionary map for legacy compatibility
    const plansDict = {};
    activePlans.forEach(p => {
      plansDict[p.planId] = {
        id: p.planId,
        planId: p.planId,
        name: p.name,
        originalPrice: p.originalPrice,
        price: p.discountedPrice,
        discountedPrice: p.discountedPrice,
        discountPercentage: p.discountPercentage,
        displayPrice: `₹${p.discountedPrice.toLocaleString('en-IN')}`,
        billingCycle: p.billingCycle || 'Per Year',
        badge: p.badge || '',
        productMonthlyLimit: p.productMonthlyLimit,
        articleMonthlyLimit: p.articleMonthlyLimit,
        maxVideosPerProduct: p.maxVideosPerProduct,
        maxVideoSizeMb: p.maxVideoSizeMb,
        features: p.features || []
      };
    });

    // Check for pending subscription request
    const pendingRequest = await PaymentRequest.findOne({
      userId: vendor._id.toString(),
      status: 'pending'
    }).sort({ createdAt: -1 }).lean();

    // Latest request history
    const recentRequests = await PaymentRequest.find({
      userId: vendor._id.toString()
    }).sort({ createdAt: -1 }).limit(10).lean();

    const now = new Date();
    const sub = vendor.subscription || {};
    const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
    const isExpired = !expiresAt || expiresAt <= now;
    const remainingDays = expiresAt && !isExpired
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let computedStatus = 'pending_payment';
    if (!isExpired && sub.status === 'active') {
      computedStatus = 'active';
    } else if (expiresAt && isExpired) {
      computedStatus = 'expired';
    }

    return res.json({
      success: true,
      b2bSalesContact: {
        contactEmail: settings.contactEmail || 'sales@netzeromart.com',
        contactPhone: settings.contactPhone || '+91 99999 00000',
        customPlanNote: settings.customPlanNote || 'Need a bespoke B2B enterprise tier or custom volume quota? Contact our commercial team directly for tailored corporate contracts.'
      },
      // Preserved for backward compatibility
      paymentInfo: {
        upiId: settings.upiId || '',
        upiName: settings.upiName || '',
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        notes: settings.notes
      },
      plans: Object.keys(plansDict).length > 0 ? plansDict : PLANS_CONFIG,
      plansList: activePlans,
      vendorSubscription: {
        status: computedStatus,
        plan: sub.plan || 'none',
        startDate: sub.startDate,
        expiresAt: sub.expiresAt,
        remainingDays,
        limits: vendor.limits || { productMonthlyLimit: 25, articleMonthlyLimit: 50 },
        hasPendingRequest: Boolean(pendingRequest),
        pendingRequest
      },
      recentRequests
    });
  } catch (error) {
    console.error('Error fetching vendor subscription info:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

/**
 * POST /api/userPanel/submit-payment
 * Vendor selects chosen plan and submits subscription activation request with optional notes.
 * No UPI / QR or UTR required!
 */
export async function submitVendorPayment(req, res) {
  try {
    const vendor = await findVendorById(req.user?._id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const { plan, vendorNote, note } = req.body;
    const requestedPlanId = String(plan || '').trim();

    if (!requestedPlanId) {
      return res.status(400).json({ success: false, error: 'Please select a subscription plan to continue' });
    }

    // Look up plan from database (or fallback)
    let planDoc = await SubscriptionPlan.findOne({ planId: requestedPlanId, isActive: true }).lean();
    if (!planDoc) {
      // Fallback check in defaults
      planDoc = PLANS_CONFIG[requestedPlanId];
    }

    if (!planDoc) {
      return res.status(400).json({ success: false, error: 'Selected plan is not recognized or is no longer active' });
    }

    const origPrice = planDoc.originalPrice || planDoc.price || 0;
    const discPrice = planDoc.discountedPrice || planDoc.price || 0;
    const cleanNote = String(vendorNote || note || '').trim();

    // Check if vendor already has an open pending request for this same plan
    const existingPending = await PaymentRequest.findOne({
      userId: vendor._id.toString(),
      status: 'pending'
    });

    if (existingPending) {
      existingPending.selectedPlan = requestedPlanId;
      existingPending.planName = planDoc.name;
      existingPending.originalPrice = origPrice;
      existingPending.discountedPrice = discPrice;
      existingPending.amount = discPrice;
      existingPending.vendorNote = cleanNote;
      await existingPending.save();

      return res.json({
        success: true,
        message: 'Your subscription activation request was updated and is being reviewed by our team.',
        request: existingPending
      });
    }

    const newRequest = await PaymentRequest.create({
      userId: vendor._id.toString(),
      companyName: vendor.companyName || 'Vendor',
      userName: vendor.userName || '',
      email: vendor.email,
      mobile: vendor.mobile || '',
      selectedPlan: requestedPlanId,
      planName: planDoc.name,
      originalPrice: origPrice,
      discountedPrice: discPrice,
      amount: discPrice,
      vendorNote: cleanNote,
      status: 'pending'
    });

    // Send notification email
    sendManualPaymentSubmittedEmail({
      to: vendor.email,
      userName: vendor.userName,
      companyName: vendor.companyName,
      plan: requestedPlanId,
      amount: discPrice,
      utrNumber: 'DIRECT_B2B_REQUEST'
    }).catch(err => console.error('Error sending submission emails:', err));

    return res.json({
      success: true,
      message: 'Subscription request submitted successfully! Our administrative team will review and activate your plan.',
      request: newRequest
    });
  } catch (error) {
    console.error('Error submitting vendor subscription request:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to submit subscription request' });
  }
}

/**
 * GET /api/plans
 * Public endpoint to view dynamic plans with % discount
 */
export async function getPublicPlans(req, res) {
  try {
    const plans = await getOrSeedPlans();
    const active = plans.filter(p => p.isActive !== false);
    return res.json({ success: true, plans: active });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch plans' });
  }
}
