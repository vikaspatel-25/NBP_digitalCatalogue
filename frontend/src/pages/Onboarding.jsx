import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  CheckCircle2, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleGetStarted = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/userPanel/complete-onboarding');
    } catch (err) {
      console.warn('Could not mark onboarding complete:', err);
    } finally {
      navigate('/userPanel');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-10 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-4 border border-emerald-500/30">
            <Sparkles size={14} />
            <span>Welcome Verified Vendor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Digital Catalogue is Ready!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
            Welcome to NetZeroMart. Here is everything you need to know about your store listings and complimentary trial.
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Trial highlight callout */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                🎁 28-Day Free Trial Activated
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                As a newly approved vendor, your digital catalogue is 100% active and free for the first 28 days. Any products or articles you post will be publicly discoverable by buyers immediately.
              </p>
            </div>
          </div>

          {/* Key Features Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 mb-1.5">
                <Store size={16} className="text-blue-600" />
                <span>Showcase Sustainable Specs</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add high-res photos, YouTube demo videos, and detailed sustainability metrics for your offerings.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 mb-1.5">
                <Smartphone size={16} className="text-emerald-600" />
                <span>No Auto-Debit Ever</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When renewing, pay manually using instant UPI or QR for just ₹49/28 days or ₹499/year. No recurring bank charges.
              </p>
            </div>
          </div>

          {/* Notice about expired catalogues */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Catalogue Visibility Rule:</span> If your 28-day period expires without manual renewal, your listings will simply be hidden from the public store until you decide to renew. Your data is always preserved safely.
          </div>

          {/* Action button */}
          <div className="pt-2 text-center">
            <button
              onClick={handleGetStarted}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-950 hover:bg-slate-800 text-white transition shadow-md active:scale-95 disabled:opacity-50"
            >
              <span>Enter Vendor Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
