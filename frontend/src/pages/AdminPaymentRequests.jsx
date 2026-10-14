import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Building,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Eye,
  X,
  FileText,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Approval modal state
  const [activeModal, setActiveModal] = useState(null); // { type: 'approve' | 'reject' | 'screenshot', request }
  const [approvalPlan, setApprovalPlan] = useState('yearly_1200');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const [toast, setToast] = useState({ type: '', message: '' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/payment-requests');
      if (res.data?.success) {
        setRequests(res.data.requests || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch payment submissions.' });
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
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openApproveModal = (req) => {
    setApprovalPlan(req.selectedPlan || 'yearly_1200');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setAdminNotes('');
    setActiveModal({ type: 'approve', request: req });
  };

  const openRejectModal = (req) => {
    setRejectionReason('Transaction ID could not be matched with our corporate bank statement.');
    setAdminNotes('');
    setActiveModal({ type: 'reject', request: req });
  };

  const openScreenshotModal = (req) => {
    setActiveModal({ type: 'screenshot', request: req });
  };

  const handleConfirmAction = async () => {
    if (!activeModal || !activeModal.request) return;
    setSubmittingAction(true);

    try {
      const reqId = activeModal.request._id;
      const isApprove = activeModal.type === 'approve';

      const payload = {
        requestId: reqId,
        action: isApprove ? 'approve' : 'reject',
        plan: isApprove ? approvalPlan : undefined,
        paymentReceivedDate: isApprove ? paymentDate : undefined,
        adminNotes,
        rejectionReason: !isApprove ? rejectionReason : undefined
      };

      const res = await axios.post('/api/admin/payment-requests/verify', payload);

      if (res.data?.success) {
        setToast({
          type: 'success',
          message: isApprove
            ? `Payment approved! ${activeModal.request.companyName} subscription activated for 1 year.`
            : `Payment reference rejected. Notice sent to vendor.`
        });
        setActiveModal(null);
        fetchRequests();
        setTimeout(() => setToast({ type: '', message: '' }), 5000);
      } else {
        setToast({ type: 'error', message: res.data?.error || 'Verification failed.' });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.response?.data?.error || 'Network error processing verification.' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    const q = search.toLowerCase();
    return (
      (r.companyName && r.companyName.toLowerCase().includes(q)) ||
      (r.userName && r.userName.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.utrNumber && r.utrNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast.message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between shadow-sm animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast({ type: '', message: '' })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Accounts & Settlement Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Payment Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verify manual UPI / bank transfers, confirm payment receipt dates, and activate 365-day digital catalogues.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Review</span>
            {counts.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {counts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === 'approved'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Approved ({counts.approved})</span>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === 'rejected'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Rejected ({counts.rejected})</span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All ({counts.total})</span>
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, UTR, email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading payment verification requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No payment requests found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'pending'
              ? 'All vendor payment submissions have been reviewed and verified!'
              : 'No matching payment records for the current filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            const planName = req.selectedPlan === 'yearly_2400'
              ? 'Enterprise Plan (₹2,400 / yr)'
              : 'Standard Plan (₹1,200 / yr)';

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Vendor & Payment Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {req.companyName || 'Vendor Company'}
                    </span>
                    <span className="text-xs text-slate-400">({req.userName})</span>

                    {/* Status Badge */}
                    {isPending && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock size={11} />
                        <span>Pending Approval</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Approved & Active</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle size={11} />
                        <span>Rejected</span>
                      </span>
                    )}

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {planName}
                    </span>
                  </div>

                  {/* UTR & Transaction Reference */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-slate-400 font-sans text-[11px]">UTR:</span>
                      <span className="font-bold text-slate-800">{req.utrNumber}</span>
                      <button
                        onClick={() => handleCopy(req.utrNumber, req._id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy UTR Reference"
                      >
                        {copiedId === req._id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Calendar size={13} />
                      <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Mail size={13} />
                      <span>{req.email}</span>
                    </div>
                  </div>

                  {/* Screenshot Proof Preview Link */}
                  {req.screenshot?.url ? (
                    <div className="pt-1">
                      <button
                        onClick={() => openScreenshotModal(req)}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye size={13} />
                        <span>View Payment Screenshot Proof</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No screenshot attached (UTR only)</div>
                  )}

                  {/* If Approved, show payment received date and expiry */}
                  {isApproved && (
                    <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        <strong>Payment Received:</strong>{' '}
                        {req.paymentReceivedDate ? new Date(req.paymentReceivedDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span>
                        <strong>Catalogue Valid Until:</strong>{' '}
                        {req.activatedExpiresAt ? new Date(req.activatedExpiresAt).toLocaleDateString() : '365 days'}
                      </span>
                      {req.adminNotes && (
                        <span>
                          <strong>Note:</strong> {req.adminNotes}
                        </span>
                      )}
                    </div>
                  )}

                  {/* If Rejected, show reason */}
                  {isRejected && (
                    <div className="text-xs text-rose-800 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                      <strong>Rejection Reason:</strong> {req.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions Desk for Pending Request */}
                {isPending && (
                  <div className="flex items-center gap-2 self-start lg:self-center flex-shrink-0">
                    <button
                      onClick={() => openApproveModal(req)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve & Activate</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-semibold text-xs transition active:scale-95"
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Modal */}
      {activeModal?.type === 'approve' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={20} />
                <h3 className="font-bold text-slate-900 text-base">Approve & Activate Subscription</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                <strong>Vendor:</strong> {activeModal.request.companyName} ({activeModal.request.userName})
              </div>
              <div>
                <strong>UTR Reference:</strong> <span className="font-mono">{activeModal.request.utrNumber}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Confirm Annual Subscription Tier <span className="text-rose-500">*</span>
                </label>
                <select
                  value={approvalPlan}
                  onChange={(e) => setApprovalPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="yearly_1200">Standard Annual Plan — ₹1,200 (25 prod/mo, 50 art/mo)</option>
                  <option value="yearly_2400">Enterprise Annual Plan — ₹2,400 (75 prod/mo, 150 art/mo - 3x limit)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Payment Received Date (Bank Credit Date) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The system will calculate the 365-day expiry date starting from this verified payment receipt date.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Admin Internal Notes (Optional)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified via HDFC corporate bank statement ending 4012"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
              Upon approval, the vendor will be granted 365 days of active catalogue exposure, monthly quotas will be set, and an automated activation invoice email will be sent.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {submittingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Confirm & Activate 365 Days</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal?.type === 'reject' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle size={20} />
                <h3 className="font-bold text-slate-900 text-base">Reject Payment Submission</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Rejecting this submission will notify <strong>{activeModal.request.companyName}</strong> by email so they can re-verify their bank statement or submit a corrected UTR.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Rejection Reason / Guidance for Vendor <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {submittingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {activeModal?.type === 'screenshot' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="text-xs font-bold text-slate-900 truncate">
                Payment Proof Screenshot — {activeModal.request.companyName} (UTR: {activeModal.request.utrNumber})
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-slate-950 rounded-xl p-2">
              <img
                src={activeModal.request.screenshot?.url}
                alt="Payment Proof"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <a
                href={activeModal.request.screenshot?.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
              >
                <span>Open full image in new tab</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
