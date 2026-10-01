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
  ShieldAlert 
} from 'lucide-react';

export default function UserApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of user currently being processed
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [rejectModal, setRejectModal] = useState(null);

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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setFeedback({ type: 'success', message: `Copied to clipboard: ${text}` });
    setTimeout(() => setFeedback({ type: '', message: '' }), 2500);
  };

  const handleApprove = async (user) => {
    setActionLoading(user._id);
    setFeedback({ type: '', message: '' });

    try {
      await axios.post('/api/admin/userApproval/approve', { userId: user._id });
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setFeedback({ type: 'success', message: `Approved ${user.companyName}! Temporary passkey emailed to ${user.email}.` });
    } catch (err) {
      console.error('Approve user error:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.response?.data || 'Failed to approve vendor.' });
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
      setFeedback({ type: 'success', message: `Rejected registration for ${rejectModal.companyName}. Notification sent.` });
      setRejectModal(null);
    } catch (err) {
      console.error('Reject user error:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.response?.data || 'Failed to reject registration.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor Registrations Approval</h1>
        <p className="text-xs text-slate-500 mt-1">Review pending business applications, inspect company verification brochures, and grant portal access.</p>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={22} />
          <span>Fetching pending registrations...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Check size={24} />
          </div>
          <h3 className="font-bold text-slate-800">All Clear!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">No pending vendor registrations awaiting review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {users.map(u => (
            <div key={u._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-blue-300 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    {u.companyName ? u.companyName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{u.companyName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <User size={13} /> {u.userName}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                  Pending Review
                </span>
              </div>

              {/* Contact Information */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Mail size={14} /> Email:
                  </span>
                  <a 
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(u.email)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {u.email} <ExternalLink size={12} />
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} /> Mobile:
                  </span>
                  <button 
                    onClick={() => handleCopy(u.mobile)}
                    className="font-mono text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                    title="Click to copy phone number"
                  >
                    {u.mobile} <Copy size={11} />
                  </button>
                </div>

                {u.document && u.document.url && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500">
                      <FileText size={14} /> Brochure / Proof:
                    </span>
                    <a
                      href={u.document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition inline-flex items-center gap-1"
                    >
                      Open Document ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectModal(u)}
                  disabled={actionLoading === u._id}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <X size={15} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(u)}
                  disabled={actionLoading === u._id}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading === u._id ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Sending Key...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Approve & Email Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Vendor Registration?</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to reject the application for <strong>"{rejectModal.companyName}"</strong> ({rejectModal.email})? A polite status update email will be dispatched and any uploaded document destroyed from Cloudinary.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}