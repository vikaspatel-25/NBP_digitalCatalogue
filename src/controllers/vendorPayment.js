import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import PlatformSettings from '../models/settings.model.js';
import PaymentRequest from '../models/paymentRequest.model.js';
import ApprovedUser from '../models/approved.user.model.js';
import User from '../models/user.model.js';
import { getOrCreateSettings } from './adminPayment.js';
import { sendManualPaymentSubmittedEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactIndexPath = path.resolve(process.cwd(), 'frontend/dist/index.html');

/**
 * Plans config for the vendor portal
 */
export const PLANS_CONFIG = {
  yearly_1200: {
    id: 'yearly_1200',
    name: 'Standard Annual Plan',
    price: 1200,
    displayPrice: '₹1,200',
    billingCycle: 'Per Year',
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
    name: 'Enterprise Annual Plan',
    price: 2400,
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
 * Helper to upload buffer to Cloudinary
 */
function uploadBufferToCloudinary(buffer, folder = 'nbp_payment_proofs') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

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
 * Returns Admin's current UPI ID, Payee Name, QR code, and available plans
 */
export async function getVendorPaymentInfo(req, res) {
  try {
    const settings = await getOrCreateSettings();
    const vendor = await findVendorById(req.user?._id);

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Check if there is an active pending payment request
    const pendingRequest = await PaymentRequest.findOne({
      userId: vendor._id.toString(),
      status: 'pending'
    }).sort({ createdAt: -1 }).lean();

    // Latest payment history
    const recentRequests = await PaymentRequest.find({
      userId: vendor._id.toString()
    }).sort({ createdAt: -1 }).limit(5).lean();

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
      paymentInfo: {
        upiId: settings.upiId,
        upiName: settings.upiName,
        qrCodeUrl: settings.qrCode?.url || '',
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        notes: settings.notes
      },
      plans: PLANS_CONFIG,
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
    console.error('Error fetching vendor payment info:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

/**
 * POST /api/userPanel/submit-payment
 * Vendor submits chosen plan, UTR / transaction ID, and optional screenshot
 */
export async function submitVendorPayment(req, res) {
  try {
    const vendor = await findVendorById(req.user?._id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const { plan, utrNumber } = req.body;

    if (!plan || !['yearly_1200', 'yearly_2400'].includes(plan)) {
      return res.status(400).json({ success: false, error: 'Please select a valid annual plan' });
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Please enter a valid UPI / UTR Transaction ID' });
    }

    const cleanUtr = utrNumber.trim();

    // Check if this UTR is already approved
    const existingApproved = await PaymentRequest.findOne({ utrNumber: cleanUtr, status: 'approved' });
    if (existingApproved) {
      return res.status(400).json({ success: false, error: 'This transaction reference is already verified for an existing subscription' });
    }

    let screenshotData = { url: '', public_id: '' };
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'nbp_payment_proofs');
      screenshotData = {
        url: uploaded.secure_url || uploaded.url,
        public_id: uploaded.public_id
      };
    }

    const amount = plan === 'yearly_2400' ? 2400 : 1200;

    const newRequest = await PaymentRequest.create({
      userId: vendor._id.toString(),
      companyName: vendor.companyName || 'Vendor',
      userName: vendor.userName || '',
      email: vendor.email,
      mobile: vendor.mobile || '',
      selectedPlan: plan,
      amount,
      utrNumber: cleanUtr,
      screenshot: screenshotData,
      status: 'pending'
    });

    // Send notifications to both Vendor and Admin
    sendManualPaymentSubmittedEmail({
      to: vendor.email,
      userName: vendor.userName,
      companyName: vendor.companyName,
      plan,
      amount,
      utrNumber: cleanUtr
    }).catch(err => console.error('Error sending submission emails:', err));

    return res.json({
      success: true,
      message: 'Payment reference submitted successfully! Our accounts team will review and activate your subscription.',
      request: newRequest
    });
  } catch (error) {
    console.error('Error submitting vendor payment:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to submit payment details' });
  }
}
