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
  X,
  BellRing,
  Clock,
  Send,
  CreditCard,
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

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({ totalVendors: 0, active: 0, expiringSoon: 0, pendingPayment: 0, expired: 0 });
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  // Deletion modal state
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [sendingReminderId, setSendingReminderId] = useState(null);

  // Renewal / Plan Choice modal state
  const [renewingUser, setRenewingUser] = useState(null);
  const [selectedManualUser, setSelectedManualUser] = useState(null);
  const [manualSearchVendor, setManualSearchVendor] = useState('');
  const [renewPlan, setRenewPlan] = useState('yearly_1200');
  const [renewDurationDays, setRenewDurationDays] = useState(365);
  const [renewNotes, setRenewNotes] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');

  // Discontinue subscription modal state
  const [discontinuingUser, setDiscontinuingUser] = useState(null);
  const [discontinueReason, setDiscontinueReason] = useState('');
  const [isDiscontinuing, setIsDiscontinuing] = useState(false);
  const [discontinueError, setDiscontinueError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const [res, plansRes] = await Promise.all([
        axios.get('/api/admin/userManagement'),
        axios.get('/api/admin/plans').catch(() => ({ data: { plans: [] } }))
      ]);

      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
        if (res.data.stats) setStats(res.data.stats);
      } else {
        setUsers(res.data.users || []);
      }

      if (plansRes.data?.plans) {
        setPlans(plansRes.data.plans);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to load active users. Please refresh the page.';
      setError(msg);
      toast.error(msg, { title: 'Network Notice' });
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
    toast.info('Copied to clipboard: ' + text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendReminder = async (user) => {
    setSendingReminderId(user._id);
    try {
      const res = await axios.post('/api/admin/send-reminder', { userId: user._id });
      if (res.data?.success) {
        const msg = `Renewal reminder email successfully sent to ${user.email}!`;
        setSuccessToast(msg);
        toast.success(msg, { title: 'Reminder Dispatched' });
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        const errText = res.data?.error || 'Failed to send reminder email';
        toast.error(errText, { title: 'Email Notice Failed' });
      }
    } catch (err) {
      console.error(err);
      const errText = err.response?.data?.error || 'Network error sending reminder email';
      toast.error(errText, { title: 'Network Failure' });
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await axios.post('/api/admin/userManagement', { userId: deletingUser._id });
      if (res.data && res.data.success) {
        setUsers(prev => prev.filter(u => u._id !== deletingUser._id));
        const msg = `Vendor "${deletingUser.companyName}" successfully removed.`;
        setSuccessToast(msg);
        toast.success(msg, { title: 'Vendor Removed' });
        setTimeout(() => setSuccessToast(''), 4000);
        setDeletingUser(null);
      } else {
        const errText = res.data?.error || 'Failed to remove vendor. Please try again.';
        setDeleteError(errText);
        toast.error(errText, { title: 'Removal Failed' });
      }
    } catch (err) {
      const errText = err.response?.data?.error || 'Network error occurred while removing vendor.';
      setDeleteError(errText);
      toast.error(errText, { title: 'Removal Failed' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlanDisplayName = (planId) => {
    if (!planId || planId === 'none') return 'No Plan';
    const allPlans = plans.length > 0 ? plans : FALLBACK_PLANS;
    const found = allPlans.find(p => p.planId === planId);
    if (found) {
      return `${found.name} (₹${(found.discountedPrice || 0).toLocaleString('en-IN')}/yr)`;
    }
    if (planId === 'yearly_2400') return 'Enterprise (₹2,400/yr)';
    if (planId === 'yearly_1200') return 'Standard (₹1,200/yr)';
    return planId;
  };

  const openRenewModal = (user = null) => {
    if (user) {
      setRenewingUser(user);
      setSelectedManualUser(user);
      setRenewPlan(user.subscription?.plan || 'yearly_1200');
    } else {
      setRenewingUser({ isManualPick: true });
      setSelectedManualUser(null);
      setManualSearchVendor('');
      setRenewPlan('yearly_1200');
    }
    setRenewDurationDays(365);
    setRenewNotes('');
    setRenewError('');
  };

  const handleConfirmRenew = async () => {
    const target = renewingUser?.isManualPick ? selectedManualUser : renewingUser;
    if (!target) {
      setRenewError('Please search and select a vendor first.');
      return;
    }

    setIsRenewing(true);
    setRenewError('');
    try {
      const res = await axios.post('/api/admin/renew-vendor', {
        userId: target._id,
        plan: renewPlan,
        durationDays: Number(renewDurationDays) || 365,
        adminNotes: renewNotes || undefined
      });

      if (res.data?.success) {
        setUsers(prev => prev.map(u => {
          if (u._id === target._id) {
            return {
              ...u,
              subscription: {
                ...u.subscription,
                ...res.data.subscription,
                computedStatus: 'active',
                remainingDays: Number(renewDurationDays) || 365,
                isExpiringSoon: false
              },
              limits: res.data.limits || u.limits
            };
          }
          return u;
        }));

        const successMsg = `Subscription renewed! "${target.companyName}" is active for ${renewDurationDays} days under ${renewPlan} plan.`;
        setSuccessToast(successMsg);
        toast.success(successMsg, { title: 'Subscription Renewed' });
        setTimeout(() => setSuccessToast(''), 4000);
        setRenewingUser(null);
        setSelectedManualUser(null);
      } else {
        const errText = res.data?.error || 'Renewal failed.';
        setRenewError(errText);
        toast.error(errText, { title: 'Renewal Failed' });
      }
    } catch (err) {
      console.error(err);
      const errText = err.response?.data?.error || err.response?.data?.message || 'Network error renewing subscription.';
      setRenewError(errText);
      toast.error(errText, { title: 'Network Failure' });
    } finally {
      setIsRenewing(false);
    }
  };

  const handleConfirmDiscontinue = async () => {
    if (!discontinuingUser) return;
    setIsDiscontinuing(true);
    setDiscontinueError('');
    try {
      const res = await axios.post('/api/admin/discontinue-subscription', {
        userId: discontinuingUser._id,
        reason: discontinueReason || undefined
      });

      if (res.data?.success) {
        setUsers(prev => prev.map(u => {
          if (u._id === discontinuingUser._id) {
            return {
              ...u,
              subscription: {
                ...u.subscription,
                ...res.data.subscription,
                computedStatus: 'expired',
                remainingDays: 0,
                isExpiringSoon: false
              }
            };
          }
          return u;
        }));

        const msg = `Subscription for "${discontinuingUser.companyName}" has been discontinued. Catalogue access revoked.`;
        setSuccessToast(msg);
        toast.success(msg, { title: 'Subscription Discontinued' });
        setTimeout(() => setSuccessToast(''), 4000);
        setDiscontinuingUser(null);
      } else {
        const errText = res.data?.error || 'Failed to discontinue subscription.';
        setDiscontinueError(errText);
        toast.error(errText, { title: 'Action Failed' });
      }
    } catch (err) {
      console.error(err);
      const errText = err.response?.data?.error || err.response?.data?.message || 'Network error discontinuing subscription.';
      setDiscontinueError(errText);
      toast.error(errText, { title: 'Network Failure' });
    } finally {
      setIsDiscontinuing(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = (
      (u.companyName && u.companyName.toLowerCase().includes(q)) ||
      (u.userName && u.userName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.userId && u.userId.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    const compStatus = u.subscription?.computedStatus || 'pending_payment';
    const remainingDays = u.subscription?.remainingDays || 0;

    if (subscriptionFilter === 'active') return compStatus === 'active';
    if (subscriptionFilter === 'expiring') return compStatus === 'active' && remainingDays <= 30;
    if (subscriptionFilter === 'pending') return compStatus === 'pending_payment';
    if (subscriptionFilter === 'expired') return compStatus === 'expired';

    return true;
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

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Vendor Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User & Vendor Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee verified corporate accounts, 365-day subscription periods, and initiate renewal reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openRenewModal(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs active:scale-95 cursor-pointer"
            title="Search and renew subscription for any vendor"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Renew Any Vendor</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {/* Stats Summary - B2B Annual Subscriptions Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setSubscriptionFilter('all')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            subscriptionFilter === 'all' ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-black text-slate-900">{stats.totalVendors || users.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">All Vendors</div>
        </div>

        <div 
          onClick={() => setSubscriptionFilter('active')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            subscriptionFilter === 'active' ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-black text-emerald-600">{stats.active || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Active (365d)</div>
        </div>

        <div 
          onClick={() => setSubscriptionFilter('expiring')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            subscriptionFilter === 'expiring' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-black text-amber-600">{stats.expiringSoon || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Expiring Soon (≤30d)</div>
        </div>

        <div 
          onClick={() => setSubscriptionFilter('pending')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            subscriptionFilter === 'pending' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-black text-blue-600">{stats.pendingPayment || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Pending Payment</div>
        </div>

        <div 
          onClick={() => setSubscriptionFilter('expired')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            subscriptionFilter === 'expired' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-black text-rose-600">{stats.expired || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Expired (Hidden)</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, representative, email, or user ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
          Showing {filteredUsers.length} of {users.length} accounts
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-2xs">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-xs text-slate-600 font-semibold">Loading vendor records...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-2xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Unable to load vendors</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
          <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-2xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            {search ? 'No matching vendors found' : 'No vendors in this category'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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
          {filteredUsers.map((user) => {
            const sub = user.subscription || {};
            const compStatus = sub.computedStatus || 'pending_payment';
            const isExpiringSoon = sub.isExpiringSoon;
            const planDisplay = getPlanDisplayName(sub.plan);

            return (
              <div
                key={user._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-black text-lg flex items-center justify-center flex-shrink-0">
                        {(user.companyName || 'V').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                          {user.companyName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{user.userName || 'Representative'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {compStatus === 'active' && !isExpiringSoon && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active ({sub.remainingDays}d)
                        </span>
                      )}
                      {compStatus === 'active' && isExpiringSoon && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          Expiring ({sub.remainingDays}d)
                        </span>
                      )}
                      {compStatus === 'pending_payment' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          Pending Payment
                        </span>
                      )}
                      {compStatus === 'expired' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Expired (Hidden)
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium">{planDisplay}</span>
                    </div>
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

                    {sub.expiresAt && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Valid Until:</span>
                        </div>
                        <span className="font-semibold text-slate-800">
                          {new Date(sub.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {sub.lastUtr && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>Last UTR:</span>
                        </div>
                        <span className="font-mono text-slate-700">{sub.lastUtr}</span>
                      </div>
                    )}
                  </div>

                  {/* Document badge */}
                  {(() => {
                    const docUrl = typeof user.document === 'string' ? user.document : user.document?.url;
                    return docUrl ? (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-100/70 transition-colors text-xs text-blue-800 font-medium group"
                        title="Open business document in a new tab"
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
                    );
                  })()}
                </div>

                {/* Action buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openRenewModal(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition active:scale-95 cursor-pointer"
                      title="Choose plan and renew subscription for this vendor"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Renew / Set Plan</span>
                    </button>

                    <button
                      onClick={() => handleSendReminder(user)}
                      disabled={sendingReminderId === user._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Send renewal reminder email to vendor"
                    >
                      {sendingReminderId === user._id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>Send Reminder</span>
                    </button>
                    {compStatus === 'active' && (
                      <button
                        onClick={() => {
                          setDiscontinuingUser(user);
                          setDiscontinueReason('');
                          setDiscontinueError('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50/60 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition active:scale-95 cursor-pointer"
                        title="Immediately discontinue and revoke active subscription"
                      >
                        <Ban className="w-3.5 h-3.5 text-amber-600" />
                        <span>Discontinue Sub</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setDeletingUser(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renew / Assign Plan Modal */}
      {renewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <ShieldCheck className="text-emerald-600" size={20} />
                <span>Renew Subscription & Assign Plan</span>
              </div>
              <button
                onClick={() => setRenewingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {renewingUser.isManualPick ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Step 1: Search & Select Vendor to Renew
                </label>
                {selectedManualUser ? (
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-extrabold text-slate-900">{selectedManualUser.companyName}</div>
                      <div className="text-slate-500 mt-0.5">{selectedManualUser.email} • ID: {selectedManualUser.userId}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 capitalize text-[11px] px-2 py-0.5 rounded-full bg-blue-100">
                        {selectedManualUser.subscription?.computedStatus || 'pending'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedManualUser(null)}
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
                        value={manualSearchVendor}
                        onChange={(e) => setManualSearchVendor(e.target.value)}
                        placeholder="Search vendor by company name, email, or user ID..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-2xs">
                      {users
                        .filter(u => {
                          if (!manualSearchVendor.trim()) return true;
                          const q = manualSearchVendor.toLowerCase();
                          return (
                            (u.companyName || '').toLowerCase().includes(q) ||
                            (u.email || '').toLowerCase().includes(q) ||
                            (u.userName || '').toLowerCase().includes(q) ||
                            (u.userId || '').toLowerCase().includes(q)
                          );
                        })
                        .slice(0, 8)
                        .map(u => (
                          <div
                            key={u._id}
                            onClick={() => {
                              setSelectedManualUser(u);
                              setRenewPlan(u.subscription?.planId || 'starter');
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
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-extrabold text-slate-900">{renewingUser.companyName}</div>
                  <div className="text-slate-500 mt-0.5">{renewingUser.email} • ID: {renewingUser.userId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className="font-extrabold text-blue-600 capitalize">
                    {renewingUser.subscription?.computedStatus || 'pending_payment'}
                  </span>
                </div>
              </div>
            )}

            {renewError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{renewError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Plan Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Subscription Plan Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {(plans.length > 0 ? plans : FALLBACK_PLANS).map((p) => {
                    const isSelected = renewPlan === p.planId;
                    return (
                      <div
                        key={p.planId}
                        onClick={() => setRenewPlan(p.planId)}
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration Presets & Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Renewal Duration
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 font-mono">{renewDurationDays} Days</span>
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
                      onClick={() => setRenewDurationDays(chip.days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        renewDurationDays === chip.days
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
                  value={renewDurationDays}
                  onChange={(e) => setRenewDurationDays(Math.max(1, Number(e.target.value) || 1))}
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
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  placeholder="Optional internal remark or custom agreed SLA..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRenewingUser(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRenew}
                disabled={isRenewing || (renewingUser?.isManualPick && !selectedManualUser)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isRenewing ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>Confirm & Renew ({renewDurationDays} Days)</span>
              </button>
            </div>
          </div>
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

      {/* Discontinue Subscription Confirmation Modal */}
      {discontinuingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
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
                <span className="font-bold text-slate-900">{discontinuingUser.companyName}</span> ({discontinuingUser.email}).
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
                placeholder="e.g. Terms violation, requested refund, SLA breach..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {discontinueError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {discontinueError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDiscontinuingUser(null);
                  setDiscontinueError('');
                }}
                disabled={isDiscontinuing}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscontinue}
                disabled={isDiscontinuing}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDiscontinuing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Discontinuing...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirm Discontinue</span>
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