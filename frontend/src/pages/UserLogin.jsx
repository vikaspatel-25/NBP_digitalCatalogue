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
  UserCheck,
  CheckCircle2,
  Globe,
  Zap,
  HelpCircle
} from 'lucide-react';

export default function UserLogin() {
  const [roleMode, setRoleMode] = useState('vendor'); // 'vendor' | 'admin'
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

  const handleRoleToggle = (mode) => {
    setRoleMode(mode);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isVendor = roleMode === 'vendor';
    const endpoint = isVendor ? '/userLogin' : '/adminLogin';
    const payload = isVendor ? { gmail, password } : { password };

    try {
      await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = isVendor ? '/userPanel' : '/admin';
    } catch (err) {
      console.error('Sign in error:', err);
      // Fallback submission if API returns plain response
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = endpoint;
        if (isVendor) {
          const inputEmail = document.createElement('input');
          inputEmail.type = 'hidden';
          inputEmail.name = 'gmail';
          inputEmail.value = gmail;
          form.appendChild(inputEmail);
        }
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
          (isVendor ? 'Invalid email or password. Please verify your credentials.' : 'Invalid administrator credentials.')
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
      const url = roleMode === 'vendor' 
        ? `/userPanel/forgotPassword?gmail=${encodeURIComponent(forgotEmail)}`
        : `/admin/forgotPassword?gmail=${encodeURIComponent(forgotEmail)}`;
      await axios.get(url);
      setForgotMessage('Your temporary passkey has been sent to your registered email address.');
    } catch (err) {
      setForgotMessage(err.response?.data || 'Could not find an active account associated with this email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const isVendor = roleMode === 'vendor';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <a href="/home" className="inline-flex items-center gap-2.5 group no-underline">
            <img 
              src="/assets/netZeroStickerIcon.png" 
              alt="NetZeroMart" 
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              NetZero<span className="text-emerald-400">Mart</span>
            </span>
          </a>
          <a 
            href="/register" 
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <span>Need an account?</span>
            <span className="text-emerald-400 underline">Apply as Vendor</span>
          </a>
        </div>

        {/* Side-by-Side Dual-Access Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          
          {/* Left Column: Adaptive Visual Brand & Portal Context */}
          <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              {/* Role Toggle Switcher in Left Hero */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-950/80 border border-slate-800 mb-8">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('vendor')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isVendor 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 size={14} />
                  <span>Vendor Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle('admin')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    !isVendor 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>Master Admin</span>
                </button>
              </div>

              {isVendor ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">
                    <Sparkles size={13} />
                    <span>Vendor Workspace</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                    Manage Your Sustainable Showcase.
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    Sign in to publish new eco-friendly products, track customer inquiries, renew subscription plans, and update specifications.
                  </p>

                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
                      <Zap size={16} className="text-emerald-400 shrink-0" />
                      <span>Instant catalogue publishing & spec updates</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
                      <Sparkles size={16} className="text-amber-400 shrink-0" />
                      <span>Complimentary 28-day free trial on first registration</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
                      <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                      <span>Direct UPI renewals with zero auto-debit</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase mb-4">
                    <ShieldCheck size={13} />
                    <span>Command Center</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                    Platform Moderation & Vendor Control.
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    Authorized administration access for vendor KYC approvals, digital catalogue moderation, and platform governance.
                  </p>

                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
                      <UserCheck size={16} className="text-blue-400 shrink-0" />
                      <span>Review & approve pending supplier registrations</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
                      <Globe size={16} className="text-emerald-400 shrink-0" />
                      <span>Real-time subscription status & revenue auditing</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Secure TLS Session</span>
              <a href="/home" className="text-slate-400 hover:text-white">Back to Home →</a>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isVendor ? 'Sign In to Vendor Portal' : 'Sign In as Administrator'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isVendor 
                  ? 'Enter your registered email and password or temporary passkey.' 
                  : 'Enter your administrator master credentials to continue.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Vendor Email (Hidden in admin-only passkey mode) */}
              {isVendor && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Business Email *
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      required
                      placeholder="vendor@company.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Password / Passkey Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {isVendor ? 'Password or Passkey *' : 'Master Password / Passkey *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModal(true);
                      setForgotMessage('');
                      setForgotEmail(gmail || '');
                    }}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Forgot passkey?
                  </button>
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password or passkey"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 ${
                    isVendor 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950' 
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{isVendor ? 'Access Vendor Portal' : 'Access Admin Console'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Switch helper for users */}
              <div className="pt-4 text-center">
                <p className="text-xs text-slate-500">
                  {isVendor ? (
                    <span>Looking for admin sign in? <button type="button" onClick={() => handleRoleToggle('admin')} className="text-blue-400 hover:underline font-semibold ml-1">Switch to Admin</button></span>
                  ) : (
                    <span>Looking for vendor sign in? <button type="button" onClick={() => handleRoleToggle('vendor')} className="text-emerald-400 hover:underline font-semibold ml-1">Switch to Vendor</button></span>
                  )}
                </p>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Forgot Passkey Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <KeyRound size={20} />
            </div>

            <h3 className="text-lg font-bold text-white">Recover Temporary Passkey</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {roleMode === 'vendor'
                ? 'Enter your registered vendor email to receive your recovery passkey.'
                : 'Enter the master administrator email address to dispatch the security passkey.'}
            </p>

            {forgotMessage && (
              <div className="p-3 mb-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasskey} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                placeholder="registered-email@domain.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForgotModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
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
