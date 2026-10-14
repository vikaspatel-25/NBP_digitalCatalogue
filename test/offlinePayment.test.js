import { describe, it } from 'node:test';
import assert from 'node:assert';
import PlatformSettings from '../src/models/settings.model.js';
import PaymentRequest from '../src/models/paymentRequest.model.js';
import { PLANS_CONFIG } from '../src/controllers/vendorPayment.js';
import { checkProductUploadQuota, checkArticleUploadQuota } from '../src/services/quotaService.js';

describe('Corporate B2B Offline UPI/QR Accounting & Payment Modules', () => {
  describe('PlatformSettings Model Schema', () => {
    it('initializes with default UPI, QR and contact values', () => {
      const settings = new PlatformSettings({});
      assert.strictEqual(settings.upiId, '');
      assert.strictEqual(settings.upiName, '');
      assert.strictEqual(typeof settings.notes, 'string');
    });

    it('accepts custom UPI ID and Payee Name', () => {
      const settings = new PlatformSettings({
        upiId: 'corporate@icici',
        upiName: 'NetZeroMart Enterprise',
        contactEmail: 'finance@netzeromart.com',
        contactPhone: '+91 99999 88888',
        notes: 'Pay using IMPS/NEFT or UPI'
      });
      assert.strictEqual(settings.upiId, 'corporate@icici');
      assert.strictEqual(settings.upiName, 'NetZeroMart Enterprise');
      assert.strictEqual(settings.contactEmail, 'finance@netzeromart.com');
    });
  });

  describe('PaymentRequest Model Schema', () => {
    it('validates a proper payment request with pending status', () => {
      const req = new PaymentRequest({
        userId: '507f1f77bcf86cd799439011',
        companyName: 'GreenTech Innovations',
        userName: 'Aarav Sharma',
        email: 'aarav@greentech.com',
        selectedPlan: 'yearly_1200',
        amount: 1200,
        utrNumber: '423409182341',
        status: 'pending'
      });

      const err = req.validateSync();
      assert.strictEqual(err, undefined);
      assert.strictEqual(req.status, 'pending');
      assert.strictEqual(req.amount, 1200);
      assert.strictEqual(req.selectedPlan, 'yearly_1200');
    });

    it('rejects invalid plan or missing UTR reference', () => {
      const req = new PaymentRequest({
        userId: '507f1f77bcf86cd799439011',
        companyName: 'GreenTech Innovations',
        email: 'aarav@greentech.com',
        selectedPlan: 'monthly_invalid',
        amount: 1200
        // missing utrNumber
      });

      const err = req.validateSync();
      assert.ok(err, 'Validation should fail');
      assert.ok(err.errors.utrNumber, 'Missing utrNumber should trigger error');
      assert.ok(err.errors.selectedPlan, 'Invalid selectedPlan should trigger error');
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
        utrNumber: 'UTR987654321012',
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
  });
});
