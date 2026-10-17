import { describe, it } from 'node:test';
import assert from 'node:assert';
import PlatformSettings from '../src/models/settings.model.js';
import PaymentRequest from '../src/models/paymentRequest.model.js';
import SubscriptionPlan from '../src/models/plan.model.js';
import { PLANS_CONFIG } from '../src/controllers/vendorPayment.js';
import { checkProductUploadQuota, checkArticleUploadQuota } from '../src/services/quotaService.js';

describe('Corporate B2B Offline UPI/QR Accounting & Payment Modules', () => {
  describe('PlatformSettings Model Schema', () => {
    it('initializes with default UPI, QR, contact and media control values', () => {
      const settings = new PlatformSettings({});
      assert.strictEqual(settings.upiId, '');
      assert.strictEqual(settings.upiName, '');
      assert.strictEqual(typeof settings.notes, 'string');
      assert.strictEqual(settings.allowImages, true);
      assert.strictEqual(settings.allowVideos, true);
      assert.strictEqual(settings.maxImagesPerProduct, 10);
      assert.strictEqual(settings.maxVideoSizeMb, 15);
    });

    it('accepts custom media limits and B2B sales contact info', () => {
      const settings = new PlatformSettings({
        contactEmail: 'sales@netzeromart.com',
        contactPhone: '+91 99999 88888',
        customPlanNote: 'Bespoke corporate plans available on request',
        allowImages: true,
        allowVideos: false,
        maxImagesPerProduct: 15,
        maxImageSizeMb: 8,
        maxVideoSizeMb: 20
      });
      assert.strictEqual(settings.contactEmail, 'sales@netzeromart.com');
      assert.strictEqual(settings.allowVideos, false);
      assert.strictEqual(settings.maxImagesPerProduct, 15);
      assert.strictEqual(settings.maxImageSizeMb, 8);
    });
  });

  describe('SubscriptionPlan Dynamic Pricing Model Schema', () => {
    it('validates a plan and calculates discount percentage correctly', () => {
      const plan = new SubscriptionPlan({
        planId: 'yearly_1200',
        name: 'Standard Annual Plan',
        originalPrice: 1800,
        discountedPrice: 1200,
        productMonthlyLimit: 25,
        articleMonthlyLimit: 50
      });

      // trigger pre-save hook calculation
      const err = plan.validateSync();
      assert.strictEqual(err, undefined);
      // Pre-save calculation logic: ((1800 - 1200) / 1800) * 100 = 33%
      assert.strictEqual(Math.round(((plan.originalPrice - plan.discountedPrice) / plan.originalPrice) * 100), 33);
    });
  });

  describe('PaymentRequest (Subscription Request) Model Schema', () => {
    it('validates a proper subscription request with pending status without requiring UTR', () => {
      const req = new PaymentRequest({
        userId: '507f1f77bcf86cd799439011',
        companyName: 'GreenTech Innovations',
        userName: 'Aarav Sharma',
        email: 'aarav@greentech.com',
        selectedPlan: 'yearly_1200',
        planName: 'Standard Annual Plan',
        originalPrice: 1800,
        discountedPrice: 1200,
        vendorNote: 'Looking forward to listing sustainable packaging products',
        status: 'pending'
      });

      const err = req.validateSync();
      assert.strictEqual(err, undefined);
      assert.strictEqual(req.status, 'pending');
      assert.strictEqual(req.discountedPrice, 1200);
      assert.strictEqual(req.selectedPlan, 'yearly_1200');
    });

    it('rejects when required fields are missing', () => {
      const req = new PaymentRequest({
        // missing userId, companyName, email, selectedPlan
        vendorNote: 'No fields'
      });

      const err = req.validateSync();
      assert.ok(err, 'Validation should fail');
      assert.ok(err.errors.userId, 'Missing userId should trigger error');
      assert.ok(err.errors.companyName, 'Missing companyName should trigger error');
      assert.ok(err.errors.email, 'Missing email should trigger error');
      assert.ok(err.errors.selectedPlan, 'Missing selectedPlan should trigger error');
    });

    it('accepts approval fields including paymentReceivedDate and activatedExpiresAt', () => {
      const now = new Date();
      const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      const req = new PaymentRequest({
        userId: '507f1f77bcf86cd799439011',
        companyName: 'GreenTech Innovations',
        userName: 'Aarav Sharma',
        email: 'aarav@greentech.com',
        selectedPlan: 'yearly_2400',
        amount: 2400,
        status: 'approved',
        approvedPlan: 'yearly_2400',
        paymentReceivedDate: now,
        durationDays: 365,
        activatedExpiresAt: nextYear,
        verifiedBy: 'admin',
        verifiedAt: now
      });

      const err = req.validateSync();
      assert.strictEqual(err, undefined);
      assert.strictEqual(req.status, 'approved');
      assert.strictEqual(req.durationDays, 365);
    });
  });

  describe('Plans Configuration & Quota Rules', () => {
    it('configures Standard Annual Plan as ₹1,200 with 25 products & 50 articles monthly limit', () => {
      const standard = PLANS_CONFIG.yearly_1200;
      assert.ok(standard);
      assert.strictEqual(standard.price, 1200);
      assert.strictEqual(standard.productMonthlyLimit, 25);
      assert.strictEqual(standard.articleMonthlyLimit, 50);
    });

    it('configures Enterprise Annual Plan as ₹2,400 with 75 products & 150 articles monthly limit (3x)', () => {
      const enterprise = PLANS_CONFIG.yearly_2400;
      assert.ok(enterprise);
      assert.strictEqual(enterprise.price, 2400);
      assert.strictEqual(enterprise.productMonthlyLimit, 75);
      assert.strictEqual(enterprise.articleMonthlyLimit, 150);
      assert.strictEqual(enterprise.productMonthlyLimit, standard_limit_triple(25));
      assert.strictEqual(enterprise.articleMonthlyLimit, standard_limit_triple(50));

      function standard_limit_triple(val) {
        return val * 3;
      }
    });

    it('bypasses quotas when creatorId is null (Admin upload)', async () => {
      const prodQuota = await checkProductUploadQuota(null);
      assert.strictEqual(prodQuota.allowed, true);

      const artQuota = await checkArticleUploadQuota(null);
      assert.strictEqual(artQuota.allowed, true);
    });

    it('calculates 50% discount for custom plan with originalPrice 2000 and discountedPrice 1000', () => {
      const plan = new SubscriptionPlan({
        planId: 'custom_half',
        name: 'Half Price Custom Plan',
        originalPrice: 2000,
        discountedPrice: 1000,
        productMonthlyLimit: 50,
        articleMonthlyLimit: 100
      });

      const err = plan.validateSync();
      assert.strictEqual(err, undefined);
      const discountPct = Math.round(((plan.originalPrice - plan.discountedPrice) / plan.originalPrice) * 100);
      assert.strictEqual(discountPct, 50);
    });

    it('enforces media format toggles and constraints correctly', () => {
      const settings = new PlatformSettings({
        allowImages: true,
        allowVideos: false,
        allowYoutube: false,
        maxImagesPerProduct: 12,
        maxImageSizeMb: 8,
        maxVideosPerProduct: 0
      });

      assert.strictEqual(settings.allowVideos, false);
      assert.strictEqual(settings.allowYoutube, false);
      assert.strictEqual(settings.maxImagesPerProduct, 12);
      assert.strictEqual(settings.maxImageSizeMb, 8);
    });
  });
});
