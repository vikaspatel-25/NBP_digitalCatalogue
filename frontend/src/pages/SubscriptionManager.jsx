import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  UploadCloud,
  XCircle,
  Calendar,
  Building,
  Mail,
  Phone,
  Info,
  ArrowRight,
  Zap,
  Layers,
  Video
} from 'lucide-react';

export default function SubscriptionManager() {
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [plans, setPlans] = useState(null);
  const [vendorSub, setVendorSub] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);

  // Submission Form State
  const [selectedPlan, setSelectedPlan] = useState('yearly_1200');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // UI helpers
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get('/api/userPanel/payment-info');
      if (res.data?.success) {
        setPaymentInfo(res.data.paymentInfo);
        setPlans(res.data.plans);
        setVendorSub(res.data.vendorSubscription);
        setRecentRequests(res.data.recentRequests || []);
        if (res.data.vendorSubscription?.plan === 'yearly_2400') {
          setSelectedPlan('yearly_2400');
        }
      }
    } catch (err) {
      console.error('Failed to load payment info:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyUpi = () => {
    if (paymentInfo?.upiId) {
      navigator.clipboard.writeText(paymentInfo.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!utrNumber || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid 12-digit UPI / UTR Transaction Reference Number.');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('plan', selectedPlan);
      formData.append('utrNumber', utrNumber.trim());
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await axios.post('/api/userPanel/submit-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Payment reference submitted successfully! Our accounts team will verify and activate your subscription.');
        setUtrNumber('');
        setScreenshotFile(null);
        setScreenshotPreview('');
        loadData();
      } else {
        setErrorMsg(res.data?.error || 'Failed to submit payment details.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Network error occurred while submitting payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading subscription details...</p>
      </div>
    );
  }

  const isSubActive = vendorSub?.status === 'active';
  const isSubExpired = vendorSub?.status === 'expired';
  const isPendingPayment = vendorSub?.status === 'pending_payment';
  const hasPendingReq = vendorSub?.hasPendingRequest;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 font-medium">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Subscription Status Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Corporate Annual Accounting</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Subscription & Quota Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct offline UPI/QR payment with 365-day digital catalogue coverage and dedicated upload quotas.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold self-start sm:self-auto transition shadow-2xs"
          >
            <RefreshCw size={13} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Current State Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Account Status
            </div>
            <div className="flex items-center gap-2">
              {isSubActive && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-emerald-700 text-base">Active Catalogue (365d)</span>
                </>
              )}
              {isSubExpired && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-rose-700 text-base">Subscription Expired</span>
                </>
              )}
              {isPendingPayment && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-700 text-base">Activation Payment Required</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isSubActive
                ? `Expires on ${vendorSub.expiresAt ? new Date(vendorSub.expiresAt).toLocaleDateString() : 'N/A'} (${vendorSub.remainingDays} days remaining)`
                : isSubExpired
                ? 'Your products and articles are temporarily hidden until renewal.'
                : 'Account verified! Complete your annual payment below to go live.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Tier
            </div>
            <div className="font-bold text-slate-900 text-base">
              {vendorSub?.plan === 'yearly_2400'
                ? 'Enterprise Annual (₹2,400/yr)'
                : vendorSub?.plan === 'yearly_1200'
                ? 'Standard Annual (₹1,200/yr)'
                : 'No Active Subscription'}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <span>Billing Cycle: 365 Days</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Monthly Upload Quotas
            </div>
            <div className="text-xs space-y-1 font-medium text-slate-700 mt-1">
              <div className="flex justify-between">
                <span>Products / month:</span>
                <span className="font-bold text-slate-900">{vendorSub?.limits?.productMonthlyLimit || 25} listings</span>
              </div>
              <div className="flex justify-between">
                <span>Articles / month:</span>
                <span className="font-bold text-slate-900">{vendorSub?.limits?.articleMonthlyLimit || 50} posts</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Video demo limit:</span>
                <span>≤{vendorSub?.limits?.maxVideoSizeMb || 15}MB clip</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Request Alert Callout */}
        {hasPendingReq && (
          <div className="mt-5 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Payment Under Verification:</span> You have submitted reference{' '}
              <span className="font-mono font-bold">{vendorSub.pendingRequest?.utrNumber}</span> for the{' '}
              {vendorSub.pendingRequest?.selectedPlan === 'yearly_2400' ? 'Enterprise (₹2,400)' : 'Standard (₹1,200)'}{' '}
              plan on {new Date(vendorSub.pendingRequest?.createdAt).toLocaleDateString()}. Our accounts team is reviewing your transfer and your subscription will activate shortly.
            </div>
          </div>
        )}
      </div>

      {/* Plan Options Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Annual Subscription Packages (Select Your Tier)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Standard Plan Card */}
          <div
            onClick={() => setSelectedPlan('yearly_1200')}
            className={`bg-white rounded-3xl p-6 sm:p-7 border-2 transition cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'yearly_1200'
                ? 'border-slate-900 shadow-md ring-4 ring-slate-900/5'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Essential Catalogue
                </span>
                <input
                  type="radio"
                  name="planSelect"
                  checked={selectedPlan === 'yearly_1200'}
                  onChange={() => setSelectedPlan('yearly_1200')}
                  className="w-4 h-4 text-slate-950 focus:ring-0"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-900">Standard Annual Plan</h3>
              <p className="text-xs text-slate-500 mt-1">For manufacturers & suppliers growing sustainable reach.</p>

              <div className="flex items-baseline gap-1 my-5">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-950">₹1,200</span>
                <span className="text-xs text-slate-500 font-medium">/ 365 days</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span><strong>25 Products</strong> per month upload quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span><strong>50 Articles</strong> per month publishing quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>1 short video clip per product (≤30s / 15MB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Unlimited YouTube video links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Full digital catalogue visibility & buyer inquiries</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan Card */}
          <div
            onClick={() => setSelectedPlan('yearly_2400')}
            className={`bg-white rounded-3xl p-6 sm:p-7 border-2 transition cursor-pointer flex flex-col justify-between relative ${
              selectedPlan === 'yearly_2400'
                ? 'border-emerald-600 shadow-md ring-4 ring-emerald-600/10'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs">
              3x Volume Quota
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  High-Volume Enterprise
                </span>
                <input
                  type="radio"
                  name="planSelect"
                  checked={selectedPlan === 'yearly_2400'}
                  onChange={() => setSelectedPlan('yearly_2400')}
                  className="w-4 h-4 text-emerald-600 focus:ring-0"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-900">Enterprise Annual Plan</h3>
              <p className="text-xs text-slate-500 mt-1">For leading enterprises with broad sustainable catalogues.</p>

              <div className="flex items-baseline gap-1 my-5">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-950">₹2,400</span>
                <span className="text-xs text-slate-500 font-medium">/ 365 days</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span><strong>75 Products</strong> per month (3x Standard Limit)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span><strong>150 Articles</strong> per month (3x Standard Limit)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Up to 2 short video clips per product (≤30s / 15MB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Priority catalogue directory placement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Dedicated corporate partner support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Submission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Step 1: Scan & Pay via UPI (Left Column - 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4 text-center">
          <div className="text-left border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 1</span>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <QrCode size={16} className="text-emerald-600" />
              <span>Scan QR or Transfer via UPI</span>
            </h3>
          </div>

          {/* QR Code Container */}
          <div className="w-52 h-52 mx-auto rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-center p-2 overflow-hidden shadow-inner">
            {paymentInfo?.qrCodeUrl ? (
              <img
                src={paymentInfo.qrCodeUrl}
                alt="Official UPI QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-1.5">
                <QrCode size={40} className="stroke-[1.2]" />
                <span>Scan Official QR Code</span>
              </div>
            )}
          </div>

          {/* UPI Address & Copy Button */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 text-left space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Beneficiary Name</div>
            <div className="text-xs font-bold text-slate-800">{paymentInfo?.upiName || 'NetZeroMart Official'}</div>

            <div className="text-[10px] font-bold text-slate-400 uppercase pt-1">UPI Address (VPA)</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-slate-900 truncate">
                {paymentInfo?.upiId || 'netzeromart@upi'}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition flex-shrink-0"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-left leading-relaxed">
            {paymentInfo?.notes ||
              'Open any UPI app (GPay, PhonePe, Paytm, BHIM or Bank App), scan this QR code or transfer the chosen plan amount, and save the 12-digit UTR reference.'}
          </div>
        </div>

        {/* Step 2: Submit UTR & Screenshot Confirmation (Right Column - 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 2</span>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-blue-600" />
              <span>Submit Payment Reference (UTR)</span>
            </h3>
          </div>

          <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
            {/* Selected Plan Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Selected Plan: </span>
                <span className="font-bold text-slate-900">
                  {selectedPlan === 'yearly_2400' ? 'Enterprise (₹2,400 / yr)' : 'Standard (₹1,200 / yr)'}
                </span>
              </div>
              <span className="font-mono font-extrabold text-sm text-slate-950">
                {selectedPlan === 'yearly_2400' ? '₹2,400' : '₹1,200'}
              </span>
            </div>

            {/* UTR Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                UPI / Bank UTR Reference Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423409182341 (12-digit reference number)"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the exact 12-digit UTR/RRN shown in your UPI payment receipt.
              </p>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Payment Screenshot Proof (Optional but Recommended)
              </label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="screenshotInput"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition shadow-2xs"
                >
                  <UploadCloud size={16} className="text-blue-600" />
                  <span>{screenshotFile ? 'Change Screenshot' : 'Upload Receipt Screenshot'}</span>
                </label>
                <input
                  id="screenshotInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {screenshotFile && (
                  <span className="text-slate-600 font-medium truncate max-w-xs">
                    {screenshotFile.name}
                  </span>
                )}
              </div>
            </div>

            {screenshotPreview && (
              <div className="w-32 h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Details...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Payment for Approval</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Submissions History */}
      {recentRequests.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            <span>My Payment Submissions History</span>
          </h3>

          <div className="space-y-2.5">
            {recentRequests.map((req) => (
              <div
                key={req._id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {req.selectedPlan === 'yearly_2400' ? 'Enterprise Plan (₹2,400)' : 'Standard Plan (₹1,200)'}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                      UTR: {req.utrNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                  {req.rejectionReason && (
                    <div className="text-rose-700 text-[11px]">
                      <strong>Reason:</strong> {req.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {req.status === 'pending' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Under Review
                    </span>
                  )}
                  {req.status === 'approved' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Approved & Live
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
