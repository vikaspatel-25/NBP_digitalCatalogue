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
  XCircle,
  Calendar,
  Building,
  Mail,
  Phone,
  Info,
  ArrowRight,
  Zap,
  Layers,
  Video,
  Send,
  Building2,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SubscriptionManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [vendorSub, setVendorSub] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [b2bContact, setB2bContact] = useState({
    contactEmail: 'sales@netzeromart.com',
    contactPhone: '+91 99999 00000',
    customPlanNote: 'NetZeroMart is a specialized B2B marketplace. Contact our corporate sales desk for bespoke enterprise quotes, custom quotas, and corporate SLA contracts.'
  });

  // Submission Form State
  const [selectedPlan, setSelectedPlan] = useState('yearly_1200');
  const [vendorNote, setVendorNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // UI helpers
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get('/api/userPanel/payment-info');
      if (res.data?.success) {
        if (res.data.plansList && Array.isArray(res.data.plansList)) {
          setPlans(res.data.plansList);
        } else if (res.data.plans && typeof res.data.plans === 'object') {
          setPlans(Object.values(res.data.plans));
        }
        setVendorSub(res.data.vendorSubscription);
        setRecentRequests(res.data.recentRequests || []);
        if (res.data.b2bSalesContact) {
          setB2bContact(res.data.b2bSalesContact);
        }
        if (res.data.vendorSubscription?.plan && res.data.vendorSubscription.plan !== 'none') {
          setSelectedPlan(res.data.vendorSubscription.plan);
        }
      }
    } catch (err) {
      console.error('Failed to load subscription info:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to load subscription details.';
      setErrorMsg(msg);
      toast.error(msg, { title: 'Subscription Error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedPlan) {
      const errorText = 'Please select a subscription plan to continue.';
      setErrorMsg(errorText);
      toast.error(errorText, { title: 'Plan Required' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post('/api/userPanel/submit-payment', {
        plan: selectedPlan,
        vendorNote: vendorNote.trim()
      });

      if (res.data?.success) {
        const msg = res.data.message || 'Subscription request submitted successfully! Our team will activate your plan shortly.';
        setSuccessMsg(msg);
        toast.success(msg, { title: 'Request Submitted' });
        setVendorNote('');
        loadData();
      } else {
        const errText = res.data?.error || 'Failed to submit subscription request.';
        setErrorMsg(errText);
        toast.error(errText, { title: 'Submission Error' });
      }
    } catch (err) {
      console.error(err);
      const errText = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '') || 'Network error occurred while submitting subscription request.';
      setErrorMsg(errText);
      toast.error(errText, { title: 'Request Failed' });
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
  const isSubPending = vendorSub?.hasPendingRequest;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3 border border-blue-200/60">
            <CreditCard size={14} />
            <span>Commercial B2B Catalogue Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Subscription & Plan Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Manage your annual catalogue access, request volume upgrades, or connect directly with our enterprise desk for custom B2B supplier contracts.
          </p>
        </div>

        {/* Current Status Pill Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[240px]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Current Catalogue Status
          </div>
          <div className="flex items-center gap-2">
            {isSubActive ? (
              <>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">Active (365 Days)</span>
              </>
            ) : isSubPending ? (
              <>
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700">Request Under Review</span>
              </>
            ) : isSubExpired ? (
              <>
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-rose-700">Subscription Expired</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700">Pending Activation</span>
              </>
            )}
          </div>
          {isSubActive && vendorSub?.expiresAt && (
            <div className="text-xs text-slate-500 mt-1">
              Expires: {new Date(vendorSub.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              <span className="ml-1 text-slate-400">({vendorSub.remainingDays} days left)</span>
            </div>
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* B2B Custom Tier Direct Contact Callout */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-white/10">
              <Building2 size={14} />
              <span>B2B Platform Privilege</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Need a Custom Enterprise Tier or Higher Volume Quota?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {b2bContact.customPlanNote || 'Because NetZeroMart is a specialized B2B trade platform, businesses can request custom enterprise arrangements, high-volume product quotas, and tailored invoicing.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            {b2bContact.contactEmail && (
              <a
                href={`mailto:${b2bContact.contactEmail}?subject=B2B Custom Plan Request - ${vendorSub?.companyName || 'Vendor'}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-xs cursor-pointer"
              >
                <Mail size={15} />
                <span>Email Commercial Desk</span>
              </a>
            )}
            {b2bContact.contactPhone && (
              <a
                href={`tel:${b2bContact.contactPhone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 cursor-pointer"
              >
                <Phone size={15} />
                <span>Call {b2bContact.contactPhone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Plans Selection Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Select Your Annual Supplier Tier
          </h2>
          <p className="text-xs text-slate-500">
            Choose your desired catalogue tier and send an activation request with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((p) => {
            const planKey = p.planId || p.id;
            const isSelected = selectedPlan === planKey;
            const isCurrent = vendorSub?.plan === planKey && isSubActive;
            const origPrice = p.originalPrice || 0;
            const discPrice = p.discountedPrice !== undefined ? p.discountedPrice : p.price;
            const discountPct = p.discountPercentage || (origPrice > discPrice && origPrice > 0 ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0);

            return (
              <div
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative rounded-3xl border-2 p-6 sm:p-7 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-md ring-4 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Top Row: Badge & Radio */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      {p.badge && (
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-2">
                          {p.badge}
                        </span>
                      )}
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {p.name}
                      </h3>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={14} className="stroke-[3]" />}
                    </div>
                  </div>

                  {/* Pricing Display with Discount % */}
                  <div className="flex items-baseline gap-2.5 mb-5 flex-wrap">
                    {origPrice > discPrice && (
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        ₹{origPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ₹{discPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      / {p.billingCycle || 'year'}
                    </span>
                    {discountPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold tracking-wide">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Quotas highlights */}
                  <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 mb-5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Quota</div>
                      <div className="text-sm font-black text-slate-900">{p.productMonthlyLimit || 25} / month</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Article Quota</div>
                      <div className="text-sm font-black text-slate-900">{p.articleMonthlyLimit || 50} / month</div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 text-xs text-slate-600 mb-6">
                    {(p.features || []).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(planKey);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Active Tier' : isSelected ? 'Plan Selected' : 'Choose Plan'}</span>
                    {isSelected && <ArrowRight size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Request Submission Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide uppercase mb-3">
            <Send size={13} />
            <span>Instant Plan Request</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Submit Your Subscription Activation Request
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Our accounts and onboarding team will review your application and activate your corporate catalogue access for 365 days.
          </p>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Selected Plan
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>{plans.find(p => (p.planId || p.id) === selectedPlan)?.name || selectedPlan}</span>
                <span className="text-blue-600">
                  ₹{(plans.find(p => (p.planId || p.id) === selectedPlan)?.discountedPrice || 1200).toLocaleString('en-IN')}/year
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Specific Business Requirements / Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={vendorNote}
                onChange={(e) => setVendorNote(e.target.value)}
                placeholder="E.g., We plan to list 40 eco-friendly packaging SKUs this quarter, please advise on custom B2B enterprise volume."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Send Subscription Request</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Subscription Request History */}
      {recentRequests.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Subscription Request History
              </h2>
              <p className="text-xs text-slate-500">
                Track status and activation records for your portal.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Admin Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {req.planName || req.selectedPlan}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      ₹{(req.discountedPrice || req.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      {req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/80">
                          <CheckCircle2 size={12} />
                          <span>Approved & Active</span>
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200/80">
                          <XCircle size={12} />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200/80">
                          <Clock size={12} />
                          <span>Under Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                      {req.adminNotes || req.rejectionReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
