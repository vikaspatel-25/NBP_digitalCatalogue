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
  Layers
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminPaymentRequests() {
  const { toast: appToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [plans, setPlans] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Approval modal state
  const [activeModal, setActiveModal] = useState(null); // { type: 'approve' | 'reject', request }
  const [approvalPlan, setApprovalPlan] = useState('yearly_1200');
  const [durationDays, setDurationDays] = useState(365);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [modalError, setModalError] = useState('');

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

  const openApproveModal = (req) => {
    setApprovalPlan(req.selectedPlan || 'yearly_1200');
    setDurationDays(365);
    setAdminNotes('');
    setModalError('');
    setActiveModal({ type: 'approve', request: req });
  };

  const openRejectModal = (req) => {
    setRejectionReason('Subscription request could not be approved at this time.');
    setAdminNotes('');
    setModalError('');
    setActiveModal({ type: 'reject', request: req });
  };

  const handleConfirmAction = async () => {
    if (!activeModal || !activeModal.request) return;
    setSubmittingAction(true);
    setModalError('');

    try {
      const reqId = activeModal.request._id;
      const isApprove = activeModal.type === 'approve';

      const payload = {
        requestId: reqId,
        action: isApprove ? 'approve' : 'reject',
        plan: isApprove ? approvalPlan : undefined,
        durationDays: isApprove ? durationDays : undefined,
        adminNotes: isApprove ? adminNotes : undefined,
        rejectionReason: !isApprove ? rejectionReason : undefined
      };

      const res = await axios.post('/api/admin/payment-requests/verify', payload);

      if (res.data?.success) {
        const successMsg = isApprove
          ? `Subscription approved! ${activeModal.request.companyName} is active for ${durationDays} days.`
          : `Subscription request rejected. Notice dispatched to vendor.`;
        appToast.success(successMsg, { title: isApprove ? 'Subscription Activated' : 'Request Rejected' });
        setActiveModal(null);
        fetchRequests();
      } else {
        const errText = res.data?.error || 'Verification failed.';
        setModalError(errText);
        appToast.error(errText, { title: 'Action Error' });
      }
    } catch (err) {
      console.error(err);
      const errText = err.response?.data?.error || err.response?.data?.message || 'Network error processing verification.';
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

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
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
                              onClick={() => openApproveModal(req)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition shadow-xs cursor-pointer active:scale-95"
                            >
                              Approve (365d)
                            </button>
                            <button
                              onClick={() => openRejectModal(req)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-[11px] transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">
                            {isApproved ? 'Activated' : 'Resolved'}
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

      {/* Approve Modal */}
      {activeModal && activeModal.type === 'approve' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <ShieldCheck className="text-emerald-600" size={20} />
                <span>Approve & Activate Subscription</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Confirm plan activation for <strong className="text-slate-900">{activeModal.request.companyName}</strong>. This will activate their catalogue and assign monthly listing quotas for 365 days.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Subscription Plan
                </label>
                <select
                  value={approvalPlan}
                  onChange={(e) => setApprovalPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {plans.length > 0 ? (
                    plans.map((p) => (
                      <option key={p.planId} value={p.planId}>
                        {p.name} — ₹{p.discountedPrice}/yr ({p.productMonthlyLimit} prods / {p.articleMonthlyLimit} arts)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="yearly_1200">Standard Annual Plan (₹1,200/yr)</option>
                      <option value="yearly_2400">Enterprise Annual Plan (₹2,400/yr)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activation Duration (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="730"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value) || 365)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingAction ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Confirm & Activate 365 Days</span>
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

    </div>
  );
}
