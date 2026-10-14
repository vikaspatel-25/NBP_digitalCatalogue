import React, { useState } from 'react';
import axios from 'axios';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Loader2, 
  KeyRound, 
  X,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Zap,
  Store,
  CheckCircle2
} from 'lucide-react';

export default function UserLogin() {
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Passkey Modal
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/userLogin', { gmail, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/userPanel';
    } catch (err) {
      console.error('Vendor login error:', err);
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/userLogin';
        const inputEmail = document.createElement('input');
        inputEmail.type = 'hidden';
        inputEmail.name = 'gmail';
        inputEmail.value = gmail;
        form.appendChild(inputEmail);
        const inputPass = document.createElement('input');
        inputPass.type = 'hidden';
        inputPass.name = 'password';
        inputPass.value = password;
        form.appendChild(inputPass);
        document.body.appendChild(form);
        form.submit();
      } catch (fErr) {
        setError(
          err.response?.data?.error || 
          err.response?.data || 
          'Invalid email or password. Please verify your credentials.'
        );
        setLoading(false);
      }
    }
  };

  const handleForgotPasskey = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMessage('');
    try {
      await axios.get(`/userPanel/forgotPassword?gmail=${encodeURIComponent(forgotEmail)}`);
      setForgotMessage('Your temporary passkey has been sent to your registered email address.');
    } catch (err) {
      setForgotMessage(err.response?.data || 'Could not find a registered account with this email.');
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
              NetZero<span className="text-emerald-600">Mart</span>
            </span>
          </a>
          <a 
            href="/register" 
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <span>Need a supplier account?</span>
            <span className="text-emerald-600 underline font-bold">Apply as Vendor</span>
          </a>
        </div>

        {/* Side-by-Side Vendor Login Panel - Light Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Left Column: Visual Brand Pitch & Value Pillars */}
          <div className="lg:col-span-5 p-8 sm:p-12 bg-slate-50/70 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-6">
                <Store size={13} />
                <span>Vendor Portal Workspace</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Manage Your Storefront & Digital Listings.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8">
                Sign in to upload new eco-friendly products, publish sustainability articles, manage your catalogue, and handle subscription renewals.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Corporate Annual Access</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">High-impact B2B catalogue exposure for certified eco suppliers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Direct UPI / QR Renewals</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Zero auto-debit. Direct corporate UPI / QR settlement for 365-day access.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-100">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Verified Marketplace Access</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Reach procurement managers looking for certified sustainable materials.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Secure Vendor Session</span>
              <a href="/pricing" className="text-emerald-700 hover:underline font-medium">Subscription Plans →</a>
            </div>
          </div>

          {/* Right Column: Vendor Sign In Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Vendor Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your registered business email and temporary passkey or password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Business Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Registered Business Email *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    required
                    placeholder="vendor@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              {/* Password / Passkey Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password or Temporary Passkey *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModal(true);
                      setForgotMessage('');
                      setForgotEmail(gmail || '');
                    }}
                    className="text-xs text-emerald-700 hover:underline font-medium"
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
                    placeholder="Enter password or security passkey"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
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
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Vendor Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 text-center">
                <a href="/adminLogin" className="text-xs text-slate-500 hover:text-slate-700">
                  Are you a system administrator? <span className="text-blue-600 underline font-semibold">Admin Sign In</span>
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

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <KeyRound size={22} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Recover Temporary Passkey</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter your registered vendor email address to receive your recovery passkey.
            </p>

            {forgotMessage && (
              <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-emerald-700">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasskey} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                placeholder="vendor@company.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-600 transition"
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
