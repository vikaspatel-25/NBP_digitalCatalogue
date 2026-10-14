import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  CheckCircle2, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  QrCode,
  Calendar,
  Layers,
  CreditCard
} from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleGetStarted = async (target = '/userPanel/subscription') => {
    setSubmitting(true);
    try {
      await axios.post('/api/userPanel/complete-onboarding');
    } catch (err) {
      console.warn('Could not mark onboarding complete:', err);
    } finally {
      navigate(target);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-10 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-4 border border-emerald-500/30">
            <Sparkles size={14} />
            <span>Corporate Verification Approved</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to NetZeroMart B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
            Your corporate documents have been verified by our team. Activate your annual subscription to launch your digital catalogue.
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Activation Step Callout */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Next Step: Activate Your 365-Day Subscription
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Choose your annual plan (Standard ₹1,200/year or Enterprise ₹2,400/year) and transfer via corporate UPI or QR code. Once confirmed, your products and articles will be active and discoverable on NetZeroMart for 365 days.
              </p>
            </div>
          </div>

          {/* Key Features Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 mb-1.5">
                <Store size={16} className="text-blue-600" />
                <span>Product & Content Quotas</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload 25 or 75 products/month with images, short video clips (≤15MB), and unlimited YouTube embeds. Publish 50 or 150 articles/month.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 mb-1.5">
                <QrCode size={16} className="text-emerald-600" />
                <span>Direct UPI / QR Settlement</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pay directly from any business bank account via UPI. Zero recurring auto-debit charges. Invoices automatically issued to your company.
              </p>
            </div>
          </div>

          {/* Notice about expired catalogues */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Storefront Visibility Notice:</span> Product and article listings remain private to your portal until your annual subscription payment is confirmed. All your drafted listings and uploads will be preserved safely.
          </div>

          {/* Action button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleGetStarted('/userPanel/subscription')}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-950 hover:bg-slate-800 text-white transition shadow-md active:scale-95 disabled:opacity-50"
            >
              <span>Activate Annual Subscription (UPI / QR)</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleGetStarted('/userPanel')}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition"
            >
              <span>Go to Dashboard First</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
