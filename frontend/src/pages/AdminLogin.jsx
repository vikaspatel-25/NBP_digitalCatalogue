import React, { useState } from 'react';
import axios from 'axios';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Loader2, 
  KeyRound, 
  X,
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Globe,
  Layers,
  Database
} from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Passkey Modal
  const [forgotModal, setForgotModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/adminLogin', { password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/admin';
    } catch (err) {
      console.error('Admin login error:', err);
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/adminLogin';
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'password';
        input.value = password;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      } catch (fErr) {
        setError('Invalid credentials or unauthorized access. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleForgotPasskey = async (e) => {
    e.preventDefault();
    if (!adminEmail) return;
    setForgotLoading(true);
    setForgotMessage('');
    try {
      await axios.get(`/admin/forgotPassword?gmail=${encodeURIComponent(adminEmail)}`);
      setForgotMessage('Passkey recovery instructions have been dispatched to your administrator email.');
    } catch (err) {
      setForgotMessage(err.response?.data || 'Failed to dispatch passkey. Ensure email is the authorized admin email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <a href="/home" className="inline-flex items-center gap-2.5 group no-underline">
            <img 
              src="/assets/netZeroStickerIcon.png" 
              alt="NetZeroMart" 
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              NetZero<span className="text-blue-600">Mart</span>
            </span>
          </a>
          <a 
            href="/userLogin" 
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <span>Are you a vendor?</span>
            <span className="text-emerald-600 underline font-bold">Vendor Login</span>
          </a>
        </div>

        {/* Side-by-Side Admin Login Panel - Light Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Left Column: Admin Console Overview */}
          <div className="lg:col-span-5 p-8 sm:p-12 bg-slate-50/70 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase mb-6">
                <ShieldCheck size={13} />
                <span>Master Administration Console</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Platform Governance & Supplier Approvals.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8">
                Master administrator gateway for managing vendor onboarding, validating GST certificates, and maintaining catalogue integrity.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Vendor Verification & Approvals</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Review submitted company documents and issue credentials.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Subscription Health & Visibility</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Audit active subscriptions, pending payment approvals, and catalogue metrics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                    <Database size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Catalogue Moderation</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Admin-level moderation and removal of obsolete listings.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Restricted Access Area</span>
              <a href="/home" className="text-slate-600 hover:text-slate-900 font-medium">Return to Storefront →</a>
            </div>
          </div>

          {/* Right Column: Admin Sign In Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Admin Console Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your administrative security passkey or password to proceed.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Security Passkey Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Master Password / Security Passkey *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModal(true);
                      setForgotMessage('');
                    }}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Forgot passkey?
                  </button>
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter security passkey"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sign In CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Authenticating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Administration Console</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 text-center">
                <a href="/userLogin" className="text-xs text-slate-500 hover:text-slate-700">
                  Are you a vendor partner? <span className="text-emerald-600 underline font-semibold">Vendor Portal Sign In</span>
                </a>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Forgot Passkey Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl relative">
            <button
              onClick={() => setForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4">
              <KeyRound size={22} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Admin Passkey Recovery</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter the authorized administrator email to dispatch the security passkey.
            </p>

            {forgotMessage && (
              <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-blue-700">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasskey} className="space-y-4">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                placeholder="admin@netzeromart.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 transition"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForgotModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Send Passkey</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
