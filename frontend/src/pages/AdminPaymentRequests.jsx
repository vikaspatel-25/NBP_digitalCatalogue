import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  Check,
  RefreshCw,
  Building,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  X,
  FileText,
  ShieldCheck,
  ArrowRight,
  Layers,
  Ban
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const FALLBACK_PLANS = [
  {
    planId: 'yearly_1200',
    name: 'Standard Annual Plan',
    discountedPrice: 1200,
    originalPrice: 1999,
    discountPercentage: 40,
    productMonthlyLimit: 25,
    articleMonthlyLimit: 50,
    maxVideosPerProduct: 1,
    maxVideoSizeMb: 15,
    isActive: true
  },
  {
    planId: 'yearly_2400',
    name: 'Enterprise Annual Plan',
    discountedPrice: 2400,
    originalPrice: 3999,
    discountPercentage: 40,
    productMonthlyLimit: 75,
    articleMonthlyLimit: 150,
    maxVideosPerProduct: 2,
    maxVideoSizeMb: 25,
    isActive: true
  }
];

export default function AdminPaymentRequests() {
  const { toast: appToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [plans, setPlans] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Approval / Renew / Discontinue modal state
  const [activeModal, setActiveModal] = useState(null); // { type: 'approve' | 'renew' | 'reject' | 'discontinue', request }
  const [approvalPlan, setApprovalPlan] = useState('yearly_1200');
  const [durationDays, setDurationDays] = useState(365);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [modalError, setModalError] = useState('');

  // Direct renew vendor search state
  const [vendorList, setVendorList] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [directRenewModal, setDirectRenewModal] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [directRenewPlan, setDirectRenewPlan] = useState('yearly_1200');
  const [directRenewDuration, setDirectRenewDuration] = useState(365);
  const [directRenewNotes, setDirectRenewNotes] = useState('');
  const [directRenewError, setDirectRenewError] = useState('');
  const [submittingDirectRenew, setSubmittingDirectRenew] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [reqRes, planRes] = await Promise.all([
        axios.get('/api/admin/payment-requests'),
        axios.get('/api/admin/plans').catch(() => ({ data: { plans: [] } }))
      ]);

      if (reqRes.data?.success) {
        setRequests(reqRes.data.requests || []);
        if (reqRes.data.counts) setCounts(reqRes.data.counts);
      }
      if (planRes.data?.plans) {
        setPlans(planRes.data.plans);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to fetch subscription requests.';
      appToast.error(errMsg, { title: 'Network Notice' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    appToast.info('Copied to clipboard: ' + text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openApproveModal = (req, isDirectRenewal = false) => {
    const preselectedPlan = req.approvedPlan || req.selectedPlan || 'yearly_1200';
    setApprovalPlan(preselectedPlan);
    setDurationDays(365);
    setAdminNotes('');
    setModalError('');
    setActiveModal({ type: isDirectRenewal ? 'renew' : 'approve', request: req });
  };

  const openRejectModal = (req) => {
    setRejectionReason('Subscription request could not be approved at this time.');
    setAdminNotes('');
    setModalError('');
    setActiveModal({ type: 'reject', request: req });
  };

  const openDiscontinueModal = (req) => {
    setAdminNotes('');
    setModalError('');
    setActiveModal({ type: 'discontinue', request: req });
  };

  const openDirectRenewModal = async () => {
    setDirectRenewModal(true);
    setSelectedVendor(null);
    setVendorSearch('');
    setDirectRenewPlan('yearly_1200');
    setDirectRenewDuration(365);
    setDirectRenewNotes('');
    setDirectRenewError('');
    if (vendorList.length === 0) {
      setLoadingVendors(true);
      try {
        const res = await axios.get('/api/admin/userManagement');
        if (res.data?.users) {
          setVendorList(res.data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVendors(false);
      }
    }
  };

  const handleConfirmDirectRenew = async () => {
    if (!selectedVendor?._id) {
      setDirectRenewError('Please select a vendor first.');
      return;
    }
    setSubmittingDirectRenew(true);
    setDirectRenewError('');
    try {
      const res = await axios.post('/api/admin/renew-vendor', {
        userId: selectedVendor._id,
        plan: directRenewPlan,
        durationDays: Number(directRenewDuration) || 365,
        adminNotes: directRenewNotes || undefined
      });
      if (res.data?.success) {
        appToast.success(
          `Subscription renewed! "${selectedVendor.companyName}" is active for ${directRenewDuration} days under ${directRenewPlan}.`,
          { title: 'Subscription Renewed' }
        );
        setDirectRenewModal(false);
        fetchRequests();
      } else {
        const err = res.data?.error || 'Failed to renew subscription.';
        setDirectRenewError(err);
        appToast.error(err, { title: 'Renewal Error' });
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Network error renewing subscription.';
      setDirectRenewError(errMsg);
      appToast.error(errMsg, { title: 'Network Failure' });
    } finally {
      setSubmittingDirectRenew(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!activeModal || !activeModal.request) return;
    setSubmittingAction(true);
    setModalError('');

    try {
      const isReject = activeModal.type === 'reject';
      const isRenew = activeModal.type === 'renew';
      const isDiscontinue = activeModal.type === 'discontinue';

      let res;
      if (isReject) {
        res = await axios.post('/api/admin/payment-requests/verify', {
          requestId: activeModal.request._id,
          action: 'reject',
          rejectionReason: rejectionReason || adminNotes
        });
      } else if (isRenew) {
        res = await axios.post('/api/admin/renew-vendor', {
          userId: activeModal.request.userId,
          plan: approvalPlan,
          durationDays: Number(durationDays) || 365,
          adminNotes: adminNotes || undefined
        });
      } else if (isDiscontinue) {
        res = await axios.post('/api/admin/discontinue-subscription', {
          userId: activeModal.request.userId,
          reason: adminNotes || undefined
        });
      } else {
        res = await axios.post('/api/admin/payment-requests/verify', {
          requestId: activeModal.request._id,
          action: 'approve',
          plan: approvalPlan,
          durationDays: Number(durationDays) || 365,
          adminNotes: adminNotes || undefined
        });
      }

      if (res.data?.success) {
        const successMsg = isReject
          ? `Subscription request rejected. Notice dispatched to vendor.`
          : isDiscontinue
          ? `Subscription discontinued for ${activeModal.request.companyName}. Catalogue access revoked.`
          : `Subscription ${isRenew ? 'renewed' : 'activated'}! ${activeModal.request.companyName} is active for ${durationDays} days.`;
        appToast.success(successMsg, {
          title: isReject
            ? 'Request Rejected'
            : isDiscontinue
            ? 'Subscription Discontinued'
            : 'Plan Assigned & Activated'
        });
        setActiveModal(null);
        fetchRequests();
      } else {
        const errText = res.data?.error || 'Action failed.';
        setModalError(errText);
        appToast.error(errText, { title: 'Action Error' });
      }
    } catch (err) {
      console.error(err);
      const errText = err.response?.data?.error || err.response?.data?.message || 'Network error processing action.';
      setModalError(errText);
      appToast.error(errText, { title: 'Network Failure' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComp = (r.companyName || '').toLowerCase().includes(q);
      const matchEmail = (r.email || '').toLowerCase().includes(q);
      const matchUser = (r.userName || '').toLowerCase().includes(q);
      const matchPlan = (r.planName || r.selectedPlan || '').toLowerCase().includes(q);
      return matchComp || matchEmail || matchUser || matchPlan;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3 border border-blue-200/60">
            <Layers size={14} />
            <span>Commercial Accounts & Subscriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Subscription Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Review incoming vendor plan requests, activate 365-day supplier catalogue access, and assign dynamic monthly product and article quotas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openDirectRenewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition active:scale-95 shadow-xs cursor-pointer"
            title="Search and renew subscription for any vendor"
          >
            <ShieldCheck size={14} />
            <span>Renew Any Vendor</span>
          </button>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Counts KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('pending')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-500/10 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1.5">
            <Clock size={13} />
            <span>Pending Review</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.pending}</div>
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
            filter === 'approved'
              ? 'bg-emerald-500/10 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            <span>Activated</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.approved}</div>
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
            filter === 'rejected'
              ? 'bg-rose-500/10 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1.5">
            <XCircle size={13} />
            <span>Rejected</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.rejected}</div>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${filter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            <Layers size={13} />
            <span>Total Requests</span>
          </div>
          <div className={`text-2xl font-black ${filter === 'all' ? 'text-white' : 'text-slate-900'}`}>{counts.total}</div>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name, contact person, email, or plan title..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer">
            Clear
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
            <p className="text-xs">Loading subscription requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No subscription requests found</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'pending' ? 'All incoming requests have been reviewed!' : 'No entries matching current filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-4">Vendor & Company</th>
                  <th className="py-4 px-4">Contact Details</th>
                  <th className="py-4 px-4">Requested Plan</th>
                  <th className="py-4 px-4">Vendor Notes</th>
                  <th className="py-4 px-4">Requested Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Vendor & Company */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {req.companyName}
                        </div>
                        {req.userName && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {req.userName}
                          </div>
                        )}
                      </td>

                      {/* Contact Details */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail size={12} className="text-slate-400" />
                          <span>{req.email}</span>
                          <button
                            onClick={() => handleCopy(req.email, `email-${req._id}`)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedId === `email-${req._id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          </button>
                        </div>
                        {req.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone size={11} className="text-slate-400" />
                            <span>{req.mobile}</span>
                          </div>
                        )}
                      </td>

                      {/* Requested Plan */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {req.planName || req.selectedPlan}
                        </div>
                        <div className="text-blue-600 font-extrabold text-xs mt-0.5">
                          ₹{(req.discountedPrice || req.amount || 0).toLocaleString('en-IN')}/yr
                        </div>
                      </td>

                      {/* Vendor Notes */}
                      <td className="py-4 px-4 max-w-xs">
                        {req.vendorNote ? (
                          <p className="text-xs text-slate-600 italic line-clamp-2">
                            "{req.vendorNote}"
                          </p>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Requested Date */}
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <div className="text-slate-400 text-[10px]">
                          {new Date(req.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Active (365d)</span>
                          </span>
                        ) : req.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                            <XCircle size={12} />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                            <Clock size={12} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openApproveModal(req, false)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
                            >
                              <ShieldCheck size={13} />
                              <span>Choose Plan & Approve</span>
                            </button>
                            <button
                              onClick={() => openRejectModal(req)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-[11px] transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openApproveModal(req, true)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1.5 border border-slate-200"
                              title="Renew vendor or switch to a different subscription plan"
                            >
                              <RefreshCw size={12} className="text-blue-600" />
                              <span>Renew / Switch</span>
                            </button>
                            <button
                              onClick={() => openDiscontinueModal(req)}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1.5 border border-amber-200"
                              title="Discontinue and revoke active subscription"
                            >
                              <Ban size={12} className="text-amber-600" />
                              <span>Discontinue</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">
                            Rejected
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve / Renew Modal */}
      {activeModal && (activeModal.type === 'approve' || activeModal.type === 'renew') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <ShieldCheck className="text-emerald-600" size={20} />
                <span>
                  {activeModal.type === 'renew' ? 'Renew & Switch Subscription Plan' : 'Choose Plan & Activate Subscription'}
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select the subscription tier and duration for <strong className="text-slate-900">{activeModal.request.companyName}</strong>. This sets monthly product & article quotas and grants 365-day supplier catalogue access.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Plan Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Subscription Plan Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {(plans.length > 0 ? plans : FALLBACK_PLANS).map((p) => {
                    const isSelected = approvalPlan === p.planId;
                    const isRequested = activeModal.request.selectedPlan === p.planId;
                    return (
                      <div
                        key={p.planId}
                        onClick={() => setApprovalPlan(p.planId)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer relative text-left ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-extrabold text-slate-900 text-xs">
                            {p.name}
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check size={10} />}
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-sm font-black text-blue-600">
                            ₹{(p.discountedPrice || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">/year</span>
                          {p.originalPrice > p.discountedPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1">
                              ₹{p.originalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                          {p.discountPercentage > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              {p.discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600 flex-shrink-0" />
                            <span><strong>{p.productMonthlyLimit}</strong> Products / mo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600 flex-shrink-0" />
                            <span><strong>{p.articleMonthlyLimit}</strong> Articles / mo</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span>Media: {p.maxVideosPerProduct || 1} video ({p.maxVideoSizeMb || 15}MB)</span>
                          </div>
                        </div>

                        {isRequested && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[9px]">
                            Requested by Vendor
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration Presets & Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Activation Duration
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 font-mono">{durationDays} Days</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {[
                    { label: '30 Days', days: 30 },
                    { label: '90 Days', days: 90 },
                    { label: '180 Days (6 Mo)', days: 180 },
                    { label: '365 Days (1 Yr)', days: 365 },
                    { label: '730 Days (2 Yrs)', days: 730 }
                  ].map((chip) => (
                    <button
                      key={chip.days}
                      type="button"
                      onClick={() => setDurationDays(chip.days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        durationDays === chip.days
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="1825"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Custom number of days..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Internal Notes / Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional internal remark or custom agreed SLA..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingAction ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Confirm & Activate ({durationDays} Days)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal && activeModal.type === 'reject' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold text-base">
                <XCircle size={20} />
                <span>Reject Subscription Request</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide feedback for rejecting <strong className="text-slate-900">{activeModal.request.companyName}</strong>. An email notification will be dispatched to the vendor.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rejection Reason (Dispatched to Vendor)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State reason for rejecting request..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingAction ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={14} />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discontinue Modal */}
      {activeModal && activeModal.type === 'discontinue' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Discontinue Subscription?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Revoke active subscription for{' '}
                <strong className="text-slate-900">{activeModal.request.companyName}</strong> ({activeModal.request.email}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <p className="font-bold mb-1">Impact of discontinuation:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                <li>Subscription status will be marked <strong>Expired</strong> immediately.</li>
                <li>Vendor's published products and articles will be hidden from the public catalogue.</li>
                <li>Vendor will be prompted to renew upon logging in.</li>
              </ul>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason / Note (Optional)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="State reason for discontinuation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingAction ? <RefreshCw size={13} className="animate-spin" /> : <Ban size={14} />}
                <span>Confirm Discontinue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Renew by User Search Modal */}
      {directRenewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <ShieldCheck className="text-blue-600" size={20} />
                <span>Direct Subscription Renewal & Plan Assignment</span>
              </div>
              <button
                onClick={() => setDirectRenewModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Vendor Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Step 1: Select Vendor to Renew
              </label>

              {selectedVendor ? (
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900">{selectedVendor.companyName}</div>
                    <div className="text-slate-500 mt-0.5">{selectedVendor.email} • ID: {selectedVendor.userId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 capitalize text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100">
                      {selectedVendor.subscription?.computedStatus || 'pending'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedVendor(null)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-[11px] cursor-pointer shadow-2xs"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      placeholder="Search vendor by company name, email, or user ID..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                      autoFocus
                    />
                  </div>

                  {loadingVendors ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-400" />
                      Loading vendor list...
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-2xs">
                      {vendorList
                        .filter((u) => {
                          if (!vendorSearch.trim()) return true;
                          const q = vendorSearch.toLowerCase();
                          return (
                            (u.companyName || '').toLowerCase().includes(q) ||
                            (u.email || '').toLowerCase().includes(q) ||
                            (u.userName || '').toLowerCase().includes(q) ||
                            (u.userId || '').toLowerCase().includes(q)
                          );
                        })
                        .slice(0, 8)
                        .map((u) => (
                          <div
                            key={u._id}
                            onClick={() => {
                              setSelectedVendor(u);
                              setDirectRenewPlan(u.subscription?.planId || 'yearly_1200');
                            }}
                            className="p-2.5 px-3 flex items-center justify-between hover:bg-blue-50/70 cursor-pointer transition text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{u.companyName}</div>
                              <div className="text-slate-400 text-[11px]">{u.email} • ID: {u.userId}</div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              u.subscription?.computedStatus === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.subscription?.computedStatus === 'expired'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.subscription?.computedStatus || 'pending'}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {directRenewError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{directRenewError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Plan Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Step 2: Choose Subscription Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {(plans.length > 0 ? plans : FALLBACK_PLANS).map((p) => {
                    const isSelected = directRenewPlan === p.planId;
                    return (
                      <div
                        key={p.planId}
                        onClick={() => setDirectRenewPlan(p.planId)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer relative text-left ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-extrabold text-slate-900 text-xs">
                            {p.name}
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check size={10} />}
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-sm font-black text-blue-600">
                            ₹{(p.discountedPrice || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">/year</span>
                          {p.originalPrice > p.discountedPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1">
                              ₹{p.originalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                          {p.discountPercentage > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              {p.discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600 flex-shrink-0" />
                            <span><strong>{p.productMonthlyLimit}</strong> Products / mo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600 flex-shrink-0" />
                            <span><strong>{p.articleMonthlyLimit}</strong> Articles / mo</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration Presets & Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Step 3: Duration
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 font-mono">{directRenewDuration} Days</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {[
                    { label: '30 Days', days: 30 },
                    { label: '90 Days', days: 90 },
                    { label: '180 Days (6 Mo)', days: 180 },
                    { label: '365 Days (1 Yr)', days: 365 },
                    { label: '730 Days (2 Yrs)', days: 730 }
                  ].map((chip) => (
                    <button
                      key={chip.days}
                      type="button"
                      onClick={() => setDirectRenewDuration(chip.days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        directRenewDuration === chip.days
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="1825"
                  value={directRenewDuration}
                  onChange={(e) => setDirectRenewDuration(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Custom number of days..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={directRenewNotes}
                  onChange={(e) => setDirectRenewNotes(e.target.value)}
                  placeholder="Optional internal remark or custom terms..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDirectRenewModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDirectRenew}
                disabled={submittingDirectRenew || !selectedVendor}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingDirectRenew ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>Confirm & Renew ({directRenewDuration} Days)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
