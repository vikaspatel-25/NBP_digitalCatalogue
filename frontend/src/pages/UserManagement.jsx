import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  UserCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  X
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  // Deletion modal state
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/userManagement');
      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
      } else {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load active users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await axios.post('/api/admin/userManagement', { userId: deletingUser._id });
      if (res.data && res.data.success) {
        setUsers(prev => prev.filter(u => u._id !== deletingUser._id));
        setSuccessToast(`Vendor "${deletingUser.companyName}" successfully removed.`);
        setTimeout(() => setSuccessToast(''), 4000);
        setDeletingUser(null);
      } else {
        setDeleteError(res.data?.error || 'Failed to remove vendor. Please try again.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Network error occurred while removing vendor.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.companyName && u.companyName.toLowerCase().includes(q)) ||
      (u.userName && u.userName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.userId && u.userId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner - Standardized Minimal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Vendor Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User & Vendor Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee active vendor profiles, verified corporate credentials, and access credentials.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{users.length}</div>
            <div className="text-xs font-medium text-slate-500">Active Vendor Accounts</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {users.filter(u => u.document?.url).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Verified Legal Docs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">100%</div>
            <div className="text-xs font-medium text-slate-500">Authorized Access Status</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, representative, email, or user ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
          Showing {filteredUsers.length} of {users.length} accounts
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading vendor records...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Unable to load vendors</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">{error}</p>
          <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">
            {search ? 'No matching vendors found' : 'No active vendors registered'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? `We couldn't find any vendor accounts matching "${search}". Try adjusting your query.`
              : 'Vendors will appear here once their registration is approved through the User Approval panel.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-black text-lg flex items-center justify-center flex-shrink-0">
                      {(user.companyName || 'V').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1">
                        {user.companyName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{user.userName || 'Representative'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Active
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50/70">
                    <span className="text-slate-400 font-medium">User ID:</span>
                    <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                      <span>{user.userId}</span>
                      <button
                        onClick={() => handleCopy(user.userId, `id-${user._id}`)}
                        title="Copy User ID"
                        className="text-slate-400 hover:text-blue-600"
                      >
                        {copiedId === `id-${user._id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email:</span>
                    </div>
                    <a
                      href={`mailto:${user.email}`}
                      className="font-medium text-slate-800 hover:text-blue-600 truncate max-w-[180px]"
                    >
                      {user.email}
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone:</span>
                    </div>
                    <a
                      href={`tel:${user.mobile}`}
                      className="font-medium text-slate-800 hover:text-blue-600 font-mono"
                    >
                      {user.mobile}
                    </a>
                  </div>

                  {user.createdAt && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Registered:</span>
                      </div>
                      <span className="text-slate-700">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Document badge */}
                {user.document?.url ? (
                  <a
                    href={user.document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-100/70 transition-colors text-xs text-blue-800 font-medium group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Business Registration Document</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-50 text-slate-400 text-xs italic flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>No legal document attached</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium capitalize">Role: {user.role || 'Vendor'}</span>
                <button
                  onClick={() => setDeletingUser(user)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove User</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center">
              Remove Vendor Account?
            </h3>

            <p className="text-sm text-slate-600 text-center mt-2">
              Are you sure you want to permanently revoke access for{' '}
              <span className="font-bold text-slate-900">{deletingUser.companyName}</span> (
              {deletingUser.email})?
            </p>

            <div className="my-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Irreversible Action</div>
                The vendor will lose access to their catalog management dashboard, and their uploaded business certificate will be deleted from Cloudinary storage.
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Removal</span>
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