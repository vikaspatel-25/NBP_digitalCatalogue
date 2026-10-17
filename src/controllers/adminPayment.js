import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import PlatformSettings from '../models/settings.model.js';
import PaymentRequest from '../models/paymentRequest.model.js';
import SubscriptionPlan, { DEFAULT_PLANS } from '../models/plan.model.js';
import ApprovedUser from '../models/approved.user.model.js';
import User from '../models/user.model.js';
import {
  sendManualPaymentSubmittedEmail,
  sendManualPaymentApprovedEmail,
  sendManualPaymentRejectedEmail
} from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactIndexPath = path.resolve(process.cwd(), 'frontend/dist/index.html');

/**
 * Serve SPA index for admin payment & plan pages
 */
export async function adminPaymentPageController(req, res) {
  try {
    return res.sendFile(reactIndexPath);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Helper to get or initialize Platform Settings
 */
export async function getOrCreateSettings() {
  let settings = await PlatformSettings.findOne({});
  if (!settings) {
    settings = await PlatformSettings.create({
      contactEmail: '',
      contactPhone: '',
      customPlanNote: 'NetZeroMart is a dedicated B2B trade platform. Contact our sales desk for bespoke enterprise quotes, custom quotas, and corporate SLA contracts.',
      allowImages: true,
      allowVideos: true,
      allowYoutube: true,
      maxImagesPerProduct: 10,
      maxImageSizeMb: 10,
      maxVideosPerProduct: 2,
      maxVideoSizeMb: 15,
      maxVideoDurationSeconds: 30,
      articleMaxCoverSizeMb: 10,
      upiId: '',
      upiName: '',
      qrCode: { url: '', public_id: '' },
      notes: ''
    });
  }
  return settings;
}

/**
 * Helper to get or seed Subscription Plans
 */
export async function getOrSeedPlans() {
  let plans = await SubscriptionPlan.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
  if (!plans || plans.length === 0) {
    await SubscriptionPlan.insertMany(DEFAULT_PLANS);
    plans = await SubscriptionPlan.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
  }
  // Ensure percentage discount is calculated for all plans
  return plans.map(p => {
    let pct = p.discountPercentage;
    if ((pct === undefined || pct === null || pct === 0) && p.originalPrice > p.discountedPrice) {
      pct = Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100);
    }
    return {
      ...p,
      discountPercentage: pct || 0
    };
  });
}

/**
 * GET /api/admin/payment-settings (Media & B2B Settings)
 */
export async function getAdminPaymentSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin payment settings:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

/**
 * POST /api/admin/payment-settings
 * Updates Media controls, file size limits, and B2B sales contact info
 */
export async function updateAdminPaymentSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    const {
      contactEmail,
      contactPhone,
      customPlanNote,
      allowImages,
      allowVideos,
      allowYoutube,
      maxImagesPerProduct,
      maxImageSizeMb,
      maxVideosPerProduct,
      maxVideoSizeMb,
      maxVideoDurationSeconds,
      articleMaxCoverSizeMb,
      notes,
      upiId,
      upiName
    } = req.body;

    if (contactEmail !== undefined) settings.contactEmail = String(contactEmail).trim();
    if (contactPhone !== undefined) settings.contactPhone = String(contactPhone).trim();
    if (customPlanNote !== undefined) settings.customPlanNote = String(customPlanNote).trim();
    if (notes !== undefined) settings.notes = String(notes).trim();
    if (upiId !== undefined) settings.upiId = String(upiId).trim();
    if (upiName !== undefined) settings.upiName = String(upiName).trim();

    // Media rate limits & format toggles
    if (allowImages !== undefined) settings.allowImages = Boolean(allowImages);
    if (allowVideos !== undefined) settings.allowVideos = Boolean(allowVideos);
    if (allowYoutube !== undefined) settings.allowYoutube = Boolean(allowYoutube);

    if (maxImagesPerProduct !== undefined) settings.maxImagesPerProduct = Math.max(1, Math.min(30, Number(maxImagesPerProduct) || 10));
    if (maxImageSizeMb !== undefined) settings.maxImageSizeMb = Math.max(1, Math.min(50, Number(maxImageSizeMb) || 10));
    if (maxVideosPerProduct !== undefined) settings.maxVideosPerProduct = Math.max(0, Math.min(10, Number(maxVideosPerProduct) || 2));
    if (maxVideoSizeMb !== undefined) settings.maxVideoSizeMb = Math.max(1, Math.min(100, Number(maxVideoSizeMb) || 15));
    if (maxVideoDurationSeconds !== undefined) settings.maxVideoDurationSeconds = Math.max(5, Math.min(300, Number(maxVideoDurationSeconds) || 30));
    if (articleMaxCoverSizeMb !== undefined) settings.articleMaxCoverSizeMb = Math.max(1, Math.min(50, Number(articleMaxCoverSizeMb) || 10));

    settings.updatedAt = new Date();
    await settings.save();

    return res.json({
      success: true,
      message: 'Media and platform configuration updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to update settings' });
  }
}

/**
 * GET /api/admin/plans
 * Returns all configured subscription plans for admin management
 */
export async function getAdminPlans(req, res) {
  try {
    const plans = await getOrSeedPlans();
    return res.json({ success: true, plans });
  } catch (error) {
    console.error('Error fetching admin plans:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch subscription plans' });
  }
}

/**
 * POST /api/admin/plans
 * Admin creates or updates a subscription plan with live price, discount, and quota settings
 */
export async function saveAdminPlan(req, res) {
  try {
    const {
      planId,
      name,
      originalPrice,
      discountedPrice,
      billingCycle,
      badge,
      productMonthlyLimit,
      articleMonthlyLimit,
      maxVideosPerProduct,
      maxVideoSizeMb,
      features,
      isActive,
      sortOrder
    } = req.body;

    if (!planId || !name) {
      return res.status(400).json({ success: false, error: 'Plan ID and Plan Name are required' });
    }

    const origPrice = Number(originalPrice) >= 0 ? Number(originalPrice) : 0;
    const discPrice = Number(discountedPrice) >= 0 ? Number(discountedPrice) : 0;
    const discountPct = origPrice > discPrice && origPrice > 0
      ? Math.round(((origPrice - discPrice) / origPrice) * 100)
      : 0;

    let plan = await SubscriptionPlan.findOne({ planId: planId.trim() });
    if (!plan) {
      plan = new SubscriptionPlan({
        planId: planId.trim(),
        name: name.trim(),
        originalPrice: origPrice,
        discountedPrice: discPrice,
        discountPercentage: discountPct,
        billingCycle: billingCycle || 'Per Year',
        badge: badge || '',
        productMonthlyLimit: Number(productMonthlyLimit) || 25,
        articleMonthlyLimit: Number(articleMonthlyLimit) || 50,
        maxVideosPerProduct: Number(maxVideosPerProduct) || 1,
        maxVideoSizeMb: Number(maxVideoSizeMb) || 15,
        features: Array.isArray(features) ? features : [],
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number(sortOrder) || 0
      });
    } else {
      plan.name = name.trim();
      plan.originalPrice = origPrice;
      plan.discountedPrice = discPrice;
      plan.discountPercentage = discountPct;
      if (billingCycle !== undefined) plan.billingCycle = billingCycle;
      if (badge !== undefined) plan.badge = badge;
      if (productMonthlyLimit !== undefined) plan.productMonthlyLimit = Number(productMonthlyLimit);
      if (articleMonthlyLimit !== undefined) plan.articleMonthlyLimit = Number(articleMonthlyLimit);
      if (maxVideosPerProduct !== undefined) plan.maxVideosPerProduct = Number(maxVideosPerProduct);
      if (maxVideoSizeMb !== undefined) plan.maxVideoSizeMb = Number(maxVideoSizeMb);
      if (features !== undefined) plan.features = Array.isArray(features) ? features : [];
      if (isActive !== undefined) plan.isActive = Boolean(isActive);
      if (sortOrder !== undefined) plan.sortOrder = Number(sortOrder);
    }

    await plan.save();

    return res.json({
      success: true,
      message: `Plan "${plan.name}" successfully saved! Discount calculated as ${discountPct}% OFF.`,
      plan
    });
  } catch (error) {
    console.error('Error saving plan:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to save plan' });
  }
}

/**
 * DELETE /api/admin/plans/:planId
 * Toggle or delete a subscription plan
 */
export async function deleteAdminPlan(req, res) {
  try {
    const { planId } = req.params;
    const plan = await SubscriptionPlan.findOne({ planId });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    return res.json({
      success: true,
      message: `Plan "${plan.name}" is now ${plan.isActive ? 'Active' : 'Inactive'}`,
      plan
    });
  } catch (error) {
    console.error('Error toggling plan:', error);
    return res.status(500).json({ success: false, error: 'Failed to update plan status' });
  }
}

/**
 * GET /api/admin/payment-requests
 * Returns all subscription requests with optional filter (pending, approved, rejected)
 */
export async function getPaymentRequests(req, res) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const requests = await PaymentRequest.find(filter).sort({ createdAt: -1 }).lean();

    const pendingCount = await PaymentRequest.countDocuments({ status: 'pending' });
    const approvedCount = await PaymentRequest.countDocuments({ status: 'approved' });
    const rejectedCount = await PaymentRequest.countDocuments({ status: 'rejected' });

    return res.json({
      success: true,
      requests,
      counts: {
        total: requests.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      }
    });
  } catch (error) {
    console.error('Error fetching subscription requests:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

/**
 * Helper to find vendor across models
 */
async function findVendor(userId) {
  let vendor = await ApprovedUser.findById(userId);
  if (!vendor) {
    vendor = await User.findById(userId);
  }
  return vendor;
}

/**
 * POST /api/admin/payment-requests/verify
 * Approves or Rejects a vendor's subscription activation request
 */
export async function verifyPaymentRequest(req, res) {
  try {
    const { requestId, action, plan, durationDays = 365, adminNotes, rejectionReason } = req.body;

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid verification parameters' });
    }

    const request = await PaymentRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Subscription request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: `This request is already ${request.status}` });
    }

    const vendor = await findVendor(request.userId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Associated vendor account not found' });
    }

    if (action === 'reject') {
      request.status = 'rejected';
      request.adminNotes = adminNotes || rejectionReason || 'Subscription request could not be approved at this time.';
      request.verifiedAt = new Date();
      await request.save();

      // Send rejection notification email
      sendManualPaymentRejectedEmail({
        to: vendor.email,
        companyName: vendor.companyName,
        userName: vendor.userName,
        utrNumber: request.utrNumber || 'N/A',
        reason: request.adminNotes
      }).catch(err => console.error('Error sending rejection email:', err));

      return res.json({
        success: true,
        message: 'Subscription request has been marked as rejected',
        request
      });
    }

    // ACTION === 'approve'
    const finalPlanId = plan || request.selectedPlan || 'yearly_1200';
    const planDoc = await SubscriptionPlan.findOne({ planId: finalPlanId }).lean();

    const activationDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    const days = Number(durationDays) > 0 ? Number(durationDays) : 365;
    const newExpiresAt = new Date(activationDate.getTime() + days * 24 * 60 * 60 * 1000);

    // Apply quotas dynamically from planDoc or default
    const productMonthlyLimit = planDoc?.productMonthlyLimit || (finalPlanId === 'yearly_2400' ? 75 : 25);
    const articleMonthlyLimit = planDoc?.articleMonthlyLimit || (finalPlanId === 'yearly_2400' ? 150 : 50);
    const maxVideoSizeMb = planDoc?.maxVideoSizeMb || 15;

    // Update Vendor Record
    vendor.subscription = {
      plan: finalPlanId,
      status: 'active',
      startDate: vendor.subscription?.startDate || activationDate,
      expiresAt: newExpiresAt,
      lastPaymentReceivedDate: activationDate,
      lastPaymentRequestId: request._id.toString()
    };
    vendor.limits = {
      productMonthlyLimit,
      articleMonthlyLimit,
      maxVideoLengthSeconds: 30,
      maxVideoSizeMb
    };
    await vendor.save();

    // Update Subscription Request Record
    request.status = 'approved';
    request.approvedPlan = finalPlanId;
    request.paymentReceivedDate = activationDate;
    request.durationDays = days;
    request.activatedExpiresAt = newExpiresAt;
    request.adminNotes = adminNotes || '';
    request.verifiedAt = new Date();
    request.verifiedBy = 'admin';
    await request.save();

    // Send Activation Email
    sendManualPaymentApprovedEmail({
      to: vendor.email,
      companyName: vendor.companyName,
      userName: vendor.userName,
      plan: finalPlanId,
      amount: planDoc?.discountedPrice || (finalPlanId === 'yearly_2400' ? 2400 : 1200),
      utrNumber: 'DIRECT_B2B_APPROVAL',
      paymentDate: activationDate,
      expiresAt: newExpiresAt,
      productMonthlyLimit,
      articleMonthlyLimit
    }).catch(err => console.error('Error sending approval email:', err));

    return res.json({
      success: true,
      message: `Subscription approved! ${vendor.companyName} is now active for ${days} days with ${productMonthlyLimit} products & ${articleMonthlyLimit} articles monthly quota.`,
      subscription: vendor.subscription,
      limits: vendor.limits,
      request
    });
  } catch (error) {
    console.error('Error verifying subscription request:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Verification failed' });
  }
}

/**
 * POST /api/admin/renew-vendor
 * Directly renews a vendor's subscription for a chosen plan and duration,
 * whether they have an open request or not.
 */
export async function directRenewVendor(req, res) {
  try {
    const { userId, plan, durationDays = 365, adminNotes } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Vendor ID is required' });
    }

    const vendor = await findVendor(userId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor account not found' });
    }

    const chosenPlanId = String(plan || 'yearly_1200').trim();
    const planDoc = await SubscriptionPlan.findOne({ planId: chosenPlanId }).lean();

    const activationDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    const days = Number(durationDays) > 0 ? Number(durationDays) : 365;
    const newExpiresAt = new Date(activationDate.getTime() + days * 24 * 60 * 60 * 1000);

    const productMonthlyLimit = planDoc?.productMonthlyLimit || (chosenPlanId === 'yearly_2400' ? 75 : 25);
    const articleMonthlyLimit = planDoc?.articleMonthlyLimit || (chosenPlanId === 'yearly_2400' ? 150 : 50);
    const maxVideoSizeMb = planDoc?.maxVideoSizeMb || 15;
    const planAmount = planDoc?.discountedPrice || (chosenPlanId === 'yearly_2400' ? 2400 : 1200);

    // Create an audit PaymentRequest record
    const auditRecord = await PaymentRequest.create({
      userId: vendor._id.toString(),
      companyName: vendor.companyName || 'Vendor',
      userName: vendor.userName || '',
      email: vendor.email,
      mobile: vendor.mobile || '',
      selectedPlan: chosenPlanId,
      planName: planDoc?.name || chosenPlanId,
      originalPrice: planDoc?.originalPrice || planAmount,
      discountedPrice: planAmount,
      amount: planAmount,
      vendorNote: 'Admin direct renewal / plan assignment',
      status: 'approved',
      approvedPlan: chosenPlanId,
      paymentReceivedDate: activationDate,
      durationDays: days,
      activatedExpiresAt: newExpiresAt,
      adminNotes: adminNotes || 'Renewed directly by administrator',
      verifiedBy: 'admin',
      verifiedAt: activationDate
    });

    // Update Vendor subscription and limits
    vendor.subscription = {
      plan: chosenPlanId,
      status: 'active',
      startDate: vendor.subscription?.startDate || activationDate,
      expiresAt: newExpiresAt,
      lastPaymentReceivedDate: activationDate,
      lastPaymentRequestId: auditRecord._id.toString()
    };
    vendor.limits = {
      productMonthlyLimit,
      articleMonthlyLimit,
      maxVideoLengthSeconds: 30,
      maxVideoSizeMb
    };
    await vendor.save();

    // Send confirmation email
    sendManualPaymentApprovedEmail({
      to: vendor.email,
      companyName: vendor.companyName,
      userName: vendor.userName,
      plan: chosenPlanId,
      amount: planAmount,
      utrNumber: 'DIRECT_ADMIN_RENEWAL',
      paymentDate: activationDate,
      expiresAt: newExpiresAt,
      productMonthlyLimit,
      articleMonthlyLimit
    }).catch(err => console.error('Error sending renewal email:', err));

    return res.json({
      success: true,
      message: `Subscription successfully renewed! ${vendor.companyName} is active for ${days} days until ${newExpiresAt.toLocaleDateString('en-IN')}.`,
      subscription: vendor.subscription,
      limits: vendor.limits
    });
  } catch (error) {
    console.error('Error in directRenewVendor:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to renew vendor subscription' });
  }
}

/**
 * POST /api/admin/discontinue-subscription
 * Immediately revokes/discontinues a vendor's subscription,
 * sets status to expired, and expiresAt to now.
 */
export async function discontinueSubscription(req, res) {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Vendor ID is required' });
    }

    const vendor = await findVendor(userId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor account not found' });
    }

    const now = new Date();
    const currentSub = vendor.subscription?.toObject ? vendor.subscription.toObject() : (vendor.subscription || {});
    vendor.subscription = {
      ...currentSub,
      status: 'expired',
      expiresAt: now
    };
    await vendor.save();

    // Audit record in PaymentRequest
    await PaymentRequest.create({
      userId: vendor._id.toString(),
      companyName: vendor.companyName || 'Vendor',
      userName: vendor.userName || '',
      email: vendor.email,
      mobile: vendor.mobile || '',
      selectedPlan: currentSub.plan || 'none',
      planName: 'Subscription Discontinued',
      originalPrice: 0,
      discountedPrice: 0,
      amount: 0,
      vendorNote: 'Admin manually discontinued subscription',
      status: 'rejected',
      adminNotes: reason || 'Subscription discontinued by administrator',
      verifiedBy: 'admin',
      verifiedAt: now
    });

    return res.json({
      success: true,
      message: `Subscription for "${vendor.companyName}" has been discontinued. Catalogue access revoked.`,
      subscription: {
        ...vendor.subscription,
        computedStatus: 'expired',
        remainingDays: 0,
        isExpiringSoon: false
      }
    });
  } catch (error) {
    console.error('Error discontinuing subscription:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to discontinue subscription' });
  }
}


