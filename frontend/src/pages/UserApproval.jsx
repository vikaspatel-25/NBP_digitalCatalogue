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
  Eye,
  Calendar
} from 'lucide-react';

export default function UserApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of user currently being processed
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [rejectModal, setRejectModal] = useState(null);
  const [docModal, setDocModal] = useState(null); // holds url of doc to preview

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
      setUsers(prev => prev.filter(u => u._id !== user._id));
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
    setActionLoading(rejectModal._id);
    setFeedback({ type: '', message: '' });

    try {
      await axios.post('/api/admin/userApproval/reject', { userId: rejectModal._id });
      setUsers(prev => prev.filter(u => u._id !== rejectModal._id));
      setFeedback({ 
        type: 'success', 
        message: `Rejected registration for ${rejectModal.companyName}.` 
      });
      setRejectModal(null);
    } catch (err) {
      console.error('Reject user error:', err);
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to reject registration.' 
      });
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
    <div className="space-y-6 max-w-6xl mx-auto">
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

                  {/* Attached Legal Document Preview */}
                  {(() => {
                    const docUrl = typeof user.document === 'string' ? user.document : user.document?.url;
                    return docUrl ? (
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium min-w-0">
                          <FileText size={18} className="text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 block truncate">Company Registration Document</span>
                            <span className="text-[11px] text-slate-500 block truncate">Uploaded during vendor registration</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDocModal(docUrl)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                            title="Quick modal preview"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                            title="Open document in a new tab"
                          >
                            <ExternalLink size={13} />
                            <span>View Doc (New Tab)</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 text-xs italic flex items-center gap-2">
                        <FileText size={15} />
                        <span>No document uploaded with this registration</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions Row */}
                {(() => {
                  const docUrl = typeof user.document === 'string' ? user.document : user.document?.url;
                  return (
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition shadow-2xs"
                            title="Open document in a new tab to review before approving"
                          >
                            <ExternalLink size={14} className="text-blue-600" />
                            <span>View Document (New Tab)</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No document attached</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 justify-end">
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
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Reject Vendor Registration?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to decline the vendor application for <strong className="text-slate-800">{rejectModal.companyName}</strong> ({rejectModal.email})?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Quick Preview Lightbox */}
      {docModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDocModal(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] p-4 flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Registration Document Preview</h4>
              <button 
                onClick={() => setDocModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50 rounded-xl my-2">
              <img 
                src={docModal} 
                alt="Document preview" 
                className="max-w-full max-h-[65vh] object-contain shadow-sm rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <a
                href={docModal}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <span>Open Full Size</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}