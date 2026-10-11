import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/user.model.js';
import ApprovedUser from '../models/approved.user.model.js';
import Transaction from '../models/transaction.model.js';
import {
  sendPaymentSuccessEmail,
  sendTrialActivatedEmail
} from '../services/emailService.js';

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not set.');
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret
  });
}

// Subscription Plans config
export const PLANS = {
  monthly: {
    id: 'monthly_28d',
    name: '28-Day Standard Plan',
    amount: 4900, // 49 INR in paise
    days: 28,
    displayPrice: '₹49',
    billingCycle: 'Every 28 Days'
  },
  yearly: {
    id: 'yearly_365d',
    name: 'Yearly Value Plan (365 Days)',
    amount: 49900, // 499 INR in paise
    days: 365,
    displayPrice: '₹499',
    billingCycle: 'Yearly (Save ₹138)',
    savings: 'Save ₹138 / 22% compared to monthly'
  }
};

/**
 * Helper to find vendor across User / Users collections
 */
async function findVendorById(userId) {
  let vendor = await ApprovedUser.findById(userId);
  if (!vendor) {
    vendor = await User.findById(userId);
  }
  return vendor;
}

/**
 * GET /api/payment/plans
 * Returns available plans and public key id
 */
export async function getSubscriptionPlans(req, res) {
  return res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || '',
    plans: PLANS
  });
}

/**
 * GET /api/payment/status
 * Returns current vendor subscription status, remaining days, and plan info
 */
export async function getSubscriptionStatus(req, res) {
  try {
    const userId = req.user?._id;
    const vendor = await findVendorById(userId);

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const now = new Date();
    const sub = vendor.subscription || {};
    const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
    const isExpired = !expiresAt || expiresAt <= now;
    const remainingDays = expiresAt && !isExpired
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const computedStatus = isExpired ? 'expired' : (sub.status || 'trial');

    // Auto update status if expired in DB
    if (isExpired && sub.status !== 'expired') {
      sub.status = 'expired';
      vendor.subscription = sub;
      await vendor.save();
    }

    return res.json({
      success: true,
      subscription: {
        status: computedStatus,
        plan: sub.plan || 'free_trial',
        startDate: sub.startDate,
        expiresAt: sub.expiresAt,
        remainingDays,
        trialAvailed: Boolean(sub.trialAvailed),
        isOnboarded: Boolean(vendor.isOnboarded)
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

/**
 * POST /api/payment/create-order
 * Creates a standard Razorpay Order (UPI / Card / Netbanking - No auto debit)
 */
export async function createOrder(req, res) {
  try {
    const { planType } = req.body;
    const selectedPlan = planType === 'yearly' ? PLANS.yearly : PLANS.monthly;

    const vendor = await findVendorById(req.user?._id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway configuration is missing. Please contact administrator.'
      });
    }

    const receipt = `sub_${vendor._id.toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

    const orderOptions = {
      amount: selectedPlan.amount,
      currency: 'INR',
      receipt,
      notes: {
        userId: vendor._id.toString(),
        userEmail: vendor.email,
        companyName: vendor.companyName || '',
        planId: selectedPlan.id,
        days: String(selectedPlan.days)
      }
    };

    const order = await rzp.orders.create(orderOptions);

    // Save transaction record in database
    await Transaction.create({
      userId: vendor._id.toString(),
      userEmail: vendor.email,
      companyName: vendor.companyName || '',
      planType: selectedPlan.id,
      amount: selectedPlan.amount,
      currency: 'INR',
      orderId: order.id,
      status: 'created',
      daysAdded: selectedPlan.days,
      previousExpiresAt: vendor.subscription?.expiresAt || null
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: selectedPlan,
      user: {
        name: vendor.userName || vendor.companyName,
        email: vendor.email,
        mobile: vendor.mobile || ''
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to initialize payment order'
    });
  }
}

/**
 * POST /api/payment/verify
 * Client-side verification fallback after Razorpay modal completes
 */
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification parameters' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ success: false, error: 'Server payment configuration missing' });
    }

    // Verify HMAC signature
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Process subscription renewal
    const result = await processSubscriptionSuccess({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      method: req.body.method || 'upi'
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Payment verified and subscription activated successfully!',
      subscription: result.subscription
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
}

/**
 * POST /api/payment/webhook
 * Razorpay Webhook endpoint with HMAC SHA256 verification
 */
export async function handleRazorpayWebhook(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(req.rawBody || JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.warn('Unauthorized Razorpay webhook signature mismatch.');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const method = paymentEntity?.method || 'upi';

      if (orderId) {
        await processSubscriptionSuccess({
          orderId,
          paymentId,
          method,
          rawWebhook: req.body
        });
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Core helper: Extend vendor subscription, update transaction, and send confirmation emails
 */
async function processSubscriptionSuccess({ orderId, paymentId, signature = null, method = 'upi', rawWebhook = null }) {
  const transaction = await Transaction.findOne({ orderId });
  if (!transaction) {
    return { success: false, error: 'Transaction record not found' };
  }

  // Idempotency: if already processed, return success
  if (transaction.status === 'paid') {
    return { success: true, alreadyProcessed: true };
  }

  const vendor = await findVendorById(transaction.userId);
  if (!vendor) {
    return { success: false, error: 'Vendor not found' };
  }

  const now = new Date();
  const currentExpiresAt = vendor.subscription?.expiresAt ? new Date(vendor.subscription.expiresAt) : null;

  // If current expiry is in the future, add to it; otherwise start from today
  const baseDate = currentExpiresAt && currentExpiresAt > now ? currentExpiresAt : now;
  const newExpiresAt = new Date(baseDate.getTime() + transaction.daysAdded * 24 * 60 * 60 * 1000);

  // Update Vendor record
  vendor.subscription = {
    plan: transaction.planType,
    status: 'active',
    trialAvailed: true,
    startDate: vendor.subscription?.startDate || now,
    expiresAt: newExpiresAt,
    lastOrderId: orderId,
    lastPaymentId: paymentId || transaction.paymentId
  };
  await vendor.save();

  // Update Transaction record
  transaction.status = 'paid';
  transaction.paymentId = paymentId || transaction.paymentId;
  transaction.signature = signature;
  transaction.method = method;
  transaction.newExpiresAt = newExpiresAt;
  if (rawWebhook) transaction.rawWebhookEvent = rawWebhook;
  await transaction.save();

  // Send Email Notifications (User and Admin)
  sendPaymentSuccessEmail({
    to: vendor.email,
    userName: vendor.userName,
    companyName: vendor.companyName,
    planType: transaction.planType,
    amount: transaction.amount,
    paymentId: paymentId || orderId,
    expiresAt: newExpiresAt
  }).catch(err => console.error('Email dispatch error on payment success:', err));

  return {
    success: true,
    subscription: vendor.subscription
  };
}

/**
 * POST /api/userPanel/complete-onboarding
 * Completes the first-time vendor onboarding tour
 */
export async function completeVendorOnboarding(req, res) {
  try {
    const userId = req.user?._id;
    const vendor = await findVendorById(userId);

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    vendor.isOnboarded = true;
    await vendor.save();

    return res.json({ success: true, message: 'Onboarding marked complete' });
  } catch (error) {
    console.error('Error completing vendor onboarding:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
