import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import PlatformSettings from '../models/settings.model.js';
import PaymentRequest from '../models/paymentRequest.model.js';
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
 * Serve SPA index for admin payment pages
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
      upiId: 'netzeromart@upi',
      upiName: 'NetZeroMart Official',
      qrCode: { url: '', public_id: '' },
      contactEmail: process.env.ADMIN_GMAIL || 'netzeromart@gmail.com',
      contactPhone: '+91 98765 43210',
      notes: 'Please transfer the exact amount using any UPI app and enter the 12-digit UTR reference number.'
    });
  }
  return settings;
}

/**
 * Helper to upload buffer to Cloudinary
 */
function uploadBufferToCloudinary(buffer, folder = 'nbp_payments') {
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
 * GET /api/admin/payment-settings
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
 * Updates UPI ID, UPI Name, Phone, and optional new QR code image
 */
export async function updateAdminPaymentSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    const { upiId, upiName, contactEmail, contactPhone, notes } = req.body;

    if (upiId !== undefined) settings.upiId = upiId.trim();
    if (upiName !== undefined) settings.upiName = upiName.trim();
    if (contactEmail !== undefined) settings.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) settings.contactPhone = contactPhone.trim();
    if (notes !== undefined) settings.notes = notes.trim();

    if (req.file) {
      // If previous QR exists, clean up
      if (settings.qrCode?.public_id) {
        try {
          await cloudinary.uploader.destroy(settings.qrCode.public_id);
        } catch (cErr) {
          console.warn('Could not delete old QR code from Cloudinary:', cErr.message);
        }
      }

      const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'nbp_qrcodes');
      settings.qrCode = {
        url: uploaded.secure_url || uploaded.url,
        public_id: uploaded.public_id
      };
    }

    settings.updatedAt = new Date();
    await settings.save();

    return res.json({
      success: true,
      message: 'Payment settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to update settings' });
  }
}

/**
 * GET /api/admin/payment-requests
 * Returns all payment requests with optional filter (pending, approved, rejected)
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
    console.error('Error fetching payment requests:', error);
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
 * Approves or Rejects a vendor's manual payment
 */
export async function verifyPaymentRequest(req, res) {
  try {
    const { requestId, action, plan, paymentReceivedDate, adminNotes, rejectionReason } = req.body;

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid verification parameters' });
    }

    const request = await PaymentRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Payment request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: `This payment is already ${request.status}` });
    }

    const vendor = await findVendor(request.userId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Associated vendor account not found' });
    }

    if (action === 'reject') {
      request.status = 'rejected';
      request.rejectionReason = rejectionReason || 'Payment could not be matched with bank records.';
      request.adminNotes = adminNotes || '';
      request.verifiedAt = new Date();
      await request.save();

      // Send rejection notification email
      sendManualPaymentRejectedEmail({
        to: vendor.email,
        companyName: vendor.companyName,
        userName: vendor.userName,
        utrNumber: request.utrNumber,
        reason: request.rejectionReason
      }).catch(err => console.error('Error sending rejection email:', err));

      return res.json({
        success: true,
        message: 'Payment request marked as rejected',
        request
      });
    }

    // ACTION === 'approve'
    const finalPlan = (plan === 'yearly_2400' || plan === 'yearly_1200')
      ? plan
      : (request.selectedPlan || 'yearly_1200');

    const paymentDate = paymentReceivedDate ? new Date(paymentReceivedDate) : new Date();

    // Calculate expiry: 365 days from paymentDate, or extend if current expiry is in future
    const now = new Date();
    const currentExpiry = vendor.subscription?.expiresAt ? new Date(vendor.subscription.expiresAt) : null;
    const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : paymentDate;
    const newExpiresAt = new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Quotas: 25/50 for 1200, 75/150 for 2400
    const isPro = finalPlan === 'yearly_2400';
    const productMonthlyLimit = isPro ? 75 : 25;
    const articleMonthlyLimit = isPro ? 150 : 50;

    // Update Vendor Record
    vendor.subscription = {
      plan: finalPlan,
      status: 'active',
      startDate: vendor.subscription?.startDate || paymentDate,
      expiresAt: newExpiresAt,
      lastPaymentReceivedDate: paymentDate,
      lastUtr: request.utrNumber,
      lastPaymentRequestId: request._id.toString()
    };
    vendor.limits = {
      productMonthlyLimit,
      articleMonthlyLimit,
      maxVideoLengthSeconds: 30,
      maxVideoSizeMb: 15
    };
    await vendor.save();

    // Update Payment Request Record
    request.status = 'approved';
    request.approvedPlan = finalPlan;
    request.paymentReceivedDate = paymentDate;
    request.durationDays = 365;
    request.activatedExpiresAt = newExpiresAt;
    request.adminNotes = adminNotes || '';
    request.verifiedAt = new Date();
    request.verifiedBy = 'admin';
    await request.save();

    // Send Approval & Activation Email with Invoice details
    sendManualPaymentApprovedEmail({
      to: vendor.email,
      companyName: vendor.companyName,
      userName: vendor.userName,
      plan: finalPlan,
      amount: isPro ? 2400 : 1200,
      utrNumber: request.utrNumber,
      paymentDate,
      expiresAt: newExpiresAt,
      productMonthlyLimit,
      articleMonthlyLimit
    }).catch(err => console.error('Error sending payment approval email:', err));

    return res.json({
      success: true,
      message: 'Payment approved and subscription activated for 1 year!',
      subscription: vendor.subscription,
      limits: vendor.limits,
      request
    });
  } catch (error) {
    console.error('Error verifying payment request:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Verification failed' });
  }
}
