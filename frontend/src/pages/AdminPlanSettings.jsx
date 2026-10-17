import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Percent,
  Sliders,
  Store,
  FileText,
  Video
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminPlanSettings() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState(null);
  const [activePlanId, setActivePlanId] = useState('yearly_1200');

  // New Plan Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planId: '',
    name: '',
    badge: '',
    billingCycle: 'Per Year',
    originalPrice: 1800,
    discountedPrice: 1200,
    productMonthlyLimit: 25,
    articleMonthlyLimit: 50,
    maxVideosPerProduct: 1,
    maxVideoSizeMb: 15,
    features: ['Upload products with images & short clips', 'Publish thought leadership articles', 'Direct B2B buyer inquiries'],
    isActive: true
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/plans');
      if (res.data?.success && res.data.plans) {
        setPlans(res.data.plans);
        if (res.data.plans.length > 0 && !res.data.plans.some(p => p.planId === activePlanId)) {
          setActivePlanId(res.data.plans[0].planId);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subscription plans.', { title: 'Network Error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdateField = (planId, field, value) => {
    setPlans(prev => prev.map(p => {
      if (p.planId !== planId) return p;
      const updated = { ...p, [field]: value };
      
      // Auto-compute discount % if prices change
      if (field === 'originalPrice' || field === 'discountedPrice') {
        const orig = field === 'originalPrice' ? Number(value) : Number(p.originalPrice);
        const disc = field === 'discountedPrice' ? Number(value) : Number(p.discountedPrice);
        if (orig > disc && orig > 0) {
          updated.discountPercentage = Math.round(((orig - disc) / orig) * 100);
        } else {
          updated.discountPercentage = 0;
        }
      }
      return updated;
    }));
  };

  const handleAddFeature = (planId) => {
    setPlans(prev => prev.map(p => {
      if (p.planId !== planId) return p;
      return {
        ...p,
        features: [...(p.features || []), 'New platform feature benefit']
      };
    }));
  };

  const handleUpdateFeature = (planId, index, text) => {
    setPlans(prev => prev.map(p => {
      if (p.planId !== planId) return p;
      const copy = [...(p.features || [])];
      copy[index] = text;
      return { ...p, features: copy };
    }));
  };

  const handleRemoveFeature = (planId, index) => {
    setPlans(prev => prev.map(p => {
      if (p.planId !== planId) return p;
      return {
        ...p,
        features: (p.features || []).filter((_, i) => i !== index)
      };
    }));
  };

  const handleSavePlan = async (plan) => {
    setSavingPlanId(plan.planId);
    try {
      const res = await axios.post('/api/admin/plans', plan);
      if (res.data?.success) {
        toast.success(res.data.message || `Plan "${plan.name}" updated successfully!`, { title: 'Plan Saved' });
        fetchPlans();
      } else {
        toast.error(res.data?.error || 'Failed to save plan.', { title: 'Save Failed' });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error updating plan.';
      toast.error(msg, { title: 'Network Error' });
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      const res = await axios.delete(`/api/admin/plans/${plan.planId}`);
      if (res.data?.success) {
        toast.success(res.data.message, { title: 'Status Changed' });
        fetchPlans();
      }
    } catch (err) {
      toast.error('Failed to change status.', { title: 'Error' });
    }
  };

  const handleCreateNewPlan = async (e) => {
    e.preventDefault();
    if (!newPlan.planId.trim() || !newPlan.name.trim()) {
      toast.error('Please enter a Plan Code and Plan Name.', { title: 'Required Fields' });
      return;
    }
    try {
      const res = await axios.post('/api/admin/plans', newPlan);
      if (res.data?.success) {
        toast.success(`Plan "${newPlan.name}" created successfully!`, { title: 'Plan Created' });
        setShowNewModal(false);
        fetchPlans();
      } else {
        toast.error(res.data?.error || 'Failed to create plan.', { title: 'Creation Failed' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create plan.', { title: 'Error' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3 border border-blue-200/60">
            <Percent size={14} />
            <span>Commercial Tiers & Dynamic Pricing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Subscription Plans & Pricing Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Configure regular list prices (MRP) and discounted offer prices. The system automatically computes and displays live percentage-off badges (<strong className="text-slate-800">% OFF</strong>) across vendor and public storefronts without requiring code changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Custom Plan</span>
          </button>
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh plans"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Plan Tabs Selection */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {plans.map((p) => {
          const isActiveTab = activePlanId === p.planId;
          const orig = Number(p.originalPrice) || 0;
          const disc = Number(p.discountedPrice) || 0;
          const pct = p.discountPercentage || (orig > disc && orig > 0 ? Math.round(((orig - disc) / orig) * 100) : 0);

          return (
            <button
              key={p.planId}
              onClick={() => setActivePlanId(p.planId)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition flex-shrink-0 cursor-pointer ${
                isActiveTab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{p.name}</span>
              {pct > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActiveTab ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {pct}% OFF
                </span>
              )}
              {!p.isActive && (
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-slate-200 text-slate-600">
                  Inactive
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Plan Editor Form */}
      {plans.filter(p => p.planId === activePlanId).map((plan) => {
        const isSaving = savingPlanId === plan.planId;
        const orig = Number(plan.originalPrice) || 0;
        const disc = Number(plan.discountedPrice) || 0;
        const discountPct = plan.discountPercentage || (orig > disc && orig > 0 ? Math.round(((orig - disc) / orig) * 100) : 0);

        return (
          <div key={plan.planId} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Top row: Plan overview & live discount pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Plan Identifier: <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{plan.planId}</code>
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Editing {plan.name}
                </h2>
              </div>

              {/* Real-time Dynamic % OFF Preview Pill */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calculated Discount</div>
                    <div className="text-sm font-black text-emerald-600">
                      {discountPct > 0 ? `${discountPct}% OFF` : 'No Discount'}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                    %{discountPct}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(plan)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    plan.isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {plan.isActive ? 'Active Plan' : 'Inactive Plan'}
                </button>
              </div>
            </div>

            {/* General Info & Pricing Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Plan Display Title
                </label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => handleUpdateField(plan.planId, 'name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Highlight Badge (Optional)
                </label>
                <input
                  type="text"
                  value={plan.badge || ''}
                  placeholder="E.g., Most Popular, 3x Volume"
                  onChange={(e) => handleUpdateField(plan.planId, 'badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Billing Cycle Interval
                </label>
                <input
                  type="text"
                  value={plan.billingCycle || 'Per Year'}
                  onChange={(e) => handleUpdateField(plan.planId, 'billingCycle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Pricing Section (MRP & Discounted Offer Price) */}
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Regular Price / MRP (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={plan.originalPrice || 0}
                    onChange={(e) => handleUpdateField(plan.planId, 'originalPrice', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Crossed out on storefront (e.g. ~~₹1,800~~)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Discounted Offer Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={plan.discountedPrice || 0}
                    onChange={(e) => handleUpdateField(plan.planId, 'discountedPrice', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold text-blue-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Actual price charged to the vendor</p>
              </div>

              {/* Real-time Math Preview Card */}
              <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                  Live Storefront Preview
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">₹{orig.toLocaleString('en-IN')}</span>
                  <span className="text-xl font-black text-slate-900">₹{disc.toLocaleString('en-IN')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {discountPct}% OFF
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Vendor saves ₹{(orig - disc > 0 ? orig - disc : 0).toLocaleString('en-IN')} ({discountPct}% discount)
                </div>
              </div>
            </div>

            {/* Quota Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Store size={15} className="text-blue-600" />
                <span>Monthly Platform Upload & Content Quotas</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Product Upload Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={plan.productMonthlyLimit || 25}
                    onChange={(e) => handleUpdateField(plan.planId, 'productMonthlyLimit', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Resets automatically on 1st of every month</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Article Publishing Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={plan.articleMonthlyLimit || 50}
                    onChange={(e) => handleUpdateField(plan.planId, 'articleMonthlyLimit', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Thought leadership posts allowed</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Direct Videos Per Product
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={plan.maxVideosPerProduct || 1}
                    onChange={(e) => handleUpdateField(plan.planId, 'maxVideosPerProduct', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Short clips (in addition to unlimited YouTube)</p>
                </div>
              </div>
            </div>

            {/* Feature Bullets Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Marketing Feature Checklist</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddFeature(plan.planId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Feature Point</span>
                </button>
              </div>

              <div className="space-y-2">
                {(plan.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleUpdateFeature(plan.planId, idx, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(plan.planId, idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove feature"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleSavePlan(plan)}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                <span>Save Changes & Publish Live</span>
              </button>
            </div>

          </div>
        );
      })}

      {/* New Plan Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <span>Create New Custom Plan</span>
              </h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Plan Code (Unique ID)
                  </label>
                  <input
                    type="text"
                    value={newPlan.planId}
                    onChange={(e) => setNewPlan({ ...newPlan, planId: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. yearly_custom"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Plan Title
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="e.g. Custom Partner Plan"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Regular Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={newPlan.originalPrice}
                    onChange={(e) => setNewPlan({ ...newPlan, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPlan.discountedPrice}
                    onChange={(e) => setNewPlan({ ...newPlan, discountedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Quota / Month
                  </label>
                  <input
                    type="number"
                    value={newPlan.productMonthlyLimit}
                    onChange={(e) => setNewPlan({ ...newPlan, productMonthlyLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Article Quota / Month
                  </label>
                  <input
                    type="number"
                    value={newPlan.articleMonthlyLimit}
                    onChange={(e) => setNewPlan({ ...newPlan, articleMonthlyLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
