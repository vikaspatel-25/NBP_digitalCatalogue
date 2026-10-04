import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Check, 
  X, 
  ExternalLink, 
  Copy, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Search,
  RefreshCw,
  Calendar
} from 'lucide-react';

export default function UserApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of user currently being processed
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [rejectModal, setRejectModal] = useState(null);
  const [modalError, setModalError] = useState('');

  const loadPending = () => {
    setLoading(true);
    axios.get('/api/admin/userApproval')
      .then(res => setUsers(res.data.users || []))
      .catch(err => {
        console.error('Failed to load pending users:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleCopy = (text, label = 'Text') => {
    navigator.clipboard.writeText(text);
    setFeedback({ type: 'success', message: `${label} copied to clipboard!` });
    setTimeout(() => setFeedback({ type: '', message: '' }), 2500);
  };

  const handleApprove = async (user) => {
    setActionLoading(user._id);
    setFeedback({ type: '', message: '' });

    try {
      const res = await axios.post('/api/admin/userApproval/approve', { userId: user._id });
      setUsers(prev => prev.filter(u => String(u._id) !== String(user._id)));
      setFeedback({ 
        type: 'success', 
        message: `Approved ${user.companyName}! Temporary passkey has been generated and dispatched to ${user.email}.` 
      });
    } catch (err) {
      console.error('Approve user error:', err);
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to approve vendor.' 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const targetId = rejectModal._id;
    const targetName = rejectModal.companyName;
    setActionLoading(targetId);
    setModalError('');
    setFeedback({ type: '', message: '' });

    try {
      const res = await axios.post('/api/admin/userApproval/reject', { userId: targetId });
      if (res.data?.success !== false) {
        setUsers(prev => prev.filter(u => String(u._id) !== String(targetId)));
        setFeedback({ 
          type: 'success', 
          message: `Rejected registration for ${targetName || 'vendor'}.` 
        });
        setRejectModal(null);
      } else {
        setModalError(res.data?.error || res.data?.message || 'Failed to reject registration.');
      }
    } catch (err) {
      console.error('Reject user error:', err);
      if (err.response?.status === 404) {
        setUsers(prev => prev.filter(u => String(u._id) !== String(targetId)));
        setFeedback({ 
          type: 'success', 
          message: `Rejected registration for ${targetName || 'vendor'}.` 
        });
        setRejectModal(null);
      } else {
        const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to reject registration. Please try again.';
        setModalError(errMsg);
        setFeedback({ 
          type: 'error', 
          message: errMsg 
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.companyName && u.companyName.toLowerCase().includes(q)) ||
      (u.userName && u.userName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner - Standardized Minimal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Building2 size={13} />
            <span>Onboarding Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Registrations Approval
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review incoming vendor applications, verify legal registration documents, and issue platform credentials.
          </p>
        </div>

        <button
          onClick={loadPending}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" /> : <AlertCircle size={18} className="flex-shrink-0" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          {users.length} {users.length === 1 ? 'application' : 'applications'} awaiting review
        </span>
      </div>

      {/* List Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Fetching pending applications...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">
            {search ? 'No matching applications' : 'Queue is all clear!'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? 'No applicants match your filter. Try adjusting your query.'
              : 'There are no pending vendor onboarding requests waiting for review at this time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredUsers.map((user) => {
            const isProcessing = actionLoading === user._id;

            return (
              <div 
                key={user._id} 
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Row: Company Name & Initial Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-black text-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        {(user.companyName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {user.companyName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <User size={12} className="text-blue-600" />
                          <span>Contact: <strong>{user.userName}</strong></span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Pending Review
                    </span>
                  </div>

                  {/* Contact Info Table */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 text-slate-500 truncate">
                        <Mail size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(user.email, 'Email')}
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Copy Email"
                      >
                        <Copy size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="font-mono">{user.mobile}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(user.mobile, 'Phone')}
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Copy Phone"
                      >
                        <Copy size={13} />
                      </button>
                    </div>

                    {user.createdAt && (
                      <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
                        <Calendar size={12} />
                        <span>Submitted on {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Attached Legal Document Link - Shown Once */}
                  {(() => {
                    const docUrl = typeof user.document === 'string' ? user.document : user.document?.url;
                    return docUrl ? (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70 transition-colors text-xs text-blue-800 font-medium group"
                        title="Open registration document in a new tab"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={16} className="text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors block truncate">
                              Company Registration Document
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              Uploaded during registration
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs shrink-0">
                          <span>View in New Tab</span>
                          <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 text-xs italic flex items-center gap-2">
                        <FileText size={15} />
                        <span>No document uploaded with this registration</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions Row */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    disabled={isProcessing}
                    onClick={() => setRejectModal(user)}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleApprove(user)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Approve Vendor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) {
              setRejectModal(null);
              setModalError('');
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Reject Vendor Registration?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to decline the vendor application for <strong className="text-slate-800">{rejectModal.companyName}</strong> ({rejectModal.email})?
              </p>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);
                  setModalError('');
                }}
                disabled={actionLoading === rejectModal._id}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading === rejectModal._id}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-semibold text-xs transition shadow-sm shadow-rose-600/20 disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading === rejectModal._id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <X size={14} />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}