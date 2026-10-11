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
  Zap,
  Info
} from 'lucide-react';

export default function SubscriptionManager() {
  const [subData, setSubData] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, plansRes] = await Promise.all([
        axios.get('/api/payment/status'),
        axios.get('/api/payment/plans')
      ]);
      if (statusRes.data.success) {
        setSubData(statusRes.data.subscription);
      }
      if (plansRes.data.success) {
        setPlans(plansRes.data.plans);
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePay = async (planType) => {
    setProcessingPlan(planType);
    setMessage('');
    setError('');

    try {
      // 1. Create Razorpay order
      const orderRes = await axios.post('/api/payment/create-order', { planType });
      if (!orderRes.data.success) {
        setError(orderRes.data.error || 'Failed to initialize payment');
        setProcessingPlan(null);
        return;
      }

      const { orderId, amount, currency, keyId, user, plan } = orderRes.data;

      // Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        // Load dynamically if not in window
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'NetZeroMart',
        description: `${plan.name} - Digital Catalogue`,
        image: '/assets/netZeroStickerIcon.png',
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile
        },
        theme: {
          color: '#0f172a'
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              setMessage('🎉 Subscription renewed successfully! Your catalogue is live.');
              loadData();
            } else {
              setError(verifyRes.data.error || 'Payment verification failed');
            }
          } catch (err) {
            setError('Payment succeeded but verification failed. Please contact support.');
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPlan(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start payment process');
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs text-slate-500 font-medium">Loading subscription details...</p>
      </div>
    );
  }

  const isExpired = subData?.status === 'expired';
  const isTrial = subData?.plan === 'free_trial' && !isExpired;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Subscription Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status</span>
              {isExpired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  <AlertTriangle size={12} /> Expired (Hidden)
                </span>
              ) : isTrial ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Sparkles size={12} /> 28-Day Free Trial Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={12} /> Active Paid Plan
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              {isExpired ? 'Your Digital Catalogue is Currently Hidden' : 'Your Catalogue is Live on Storefront'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isExpired
                ? 'Renew your plan below via instant UPI to immediately restore all products and articles to buyers.'
                : `Your subscription expires in ${subData?.remainingDays || 0} day(s) on ${subData?.expiresAt ? new Date(subData.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}.`}
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Pricing Plan Selector */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Available Renewal Plans (Instant UPI / QR - No Auto Debit)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard 28d */}
            <div className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">28-Day Standard Plan</h4>
                  <span className="text-base font-extrabold text-slate-900">₹49</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  28 days of uninterrupted digital catalogue visibility. No automatic renewal.
                </p>
              </div>

              <button
                onClick={() => handlePay('monthly')}
                disabled={processingPlan !== null}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                <span>{processingPlan === 'monthly' ? 'Preparing Checkout...' : 'Pay ₹49 via UPI (28 Days)'}</span>
              </button>
            </div>

            {/* Yearly 365d */}
            <div className="p-5 rounded-xl border-2 border-emerald-500 hover:border-emerald-600 transition flex flex-col justify-between bg-emerald-50/20 relative">
              <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Save ₹138 (~22% Off)
              </span>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">Yearly Value Plan (365 Days)</h4>
                  <span className="text-base font-extrabold text-slate-900">₹499</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Full 365 days of storefront exposure. Best value for serious sustainable suppliers.
                </p>
              </div>

              <button
                onClick={() => handlePay('yearly')}
                disabled={processingPlan !== null}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                <span>{processingPlan === 'yearly' ? 'Preparing Checkout...' : 'Pay ₹499 via UPI (365 Days)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-100/70 border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-600">
          <Info size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>100% User-Controlled:</strong> Payments are processed via standard Razorpay Checkout supporting Google Pay, PhonePe, Paytm, BHIM UPI, NetBanking, and Debit Cards. We never auto-debit your bank.
          </span>
        </div>
      </div>
    </div>
  );
}
