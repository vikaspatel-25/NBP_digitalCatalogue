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
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function UserLogin() {
  const { toast } = useToast();

  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Forgot Passkey Modal
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const clearFieldError = (name) => {
    setFieldErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    if (!gmail.trim()) {
      errors.gmail = 'Please enter your registered email address';
    }
    if (!password) {
      errors.password = 'Please enter your password or passkey';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0], { title: 'Required Fields' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/userLogin', { gmail: gmail.trim(), password }, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      toast.success('Login successful! Redirecting to vendor portal...', { title: 'Authenticated' });
      window.location.href = res.data?.redirectUrl || '/userPanel';
    } catch (err) {
      console.error('Vendor login error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : '');
      const finalMsg = serverMsg || 'Invalid email or credentials. Please verify your login details.';
      setError(finalMsg);
      toast.error(finalMsg, { title: 'Authentication Failed' });
      setLoading(false);
    }
  };

  const handleForgotPasskey = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.warning('Please enter your email address to recover your passkey.');
      return;
    }
    setForgotLoading(true);
    setForgotMessage('');
    try {
      await axios.get(`/userPanel/forgotPassword?gmail=${encodeURIComponent(forgotEmail.trim())}`);
      const successMsg = 'Your temporary passkey has been sent to your registered email address.';
      setForgotMessage(successMsg);
      toast.success(successMsg, { title: 'Passkey Sent' });
    } catch (err) {
      const errMsg = err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Could not find a registered account with this email.');
      setForgotMessage(errMsg);
      toast.error(errMsg, { title: 'Recovery Failed' });
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
              NetZero<span className="text-emerald-700">Mart</span>
            </span>
          </a>

          <a 
            href="/home" 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Storefront</span>
          </a>
        </div>

        {/* Auth Container Card */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Hero Sidebar */}
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <Store size={13} />
                <span>Vendor Portal</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                  Manage Your Digital Catalogue
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Sign in with your registered email and temporary passkey or updated password to manage listings and track inquiries.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Publish and manage sustainable product listings</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Monitor active subscription and upload quota limits</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Publish industry articles and track direct buyer inquiries</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-xs text-slate-400">
              Need vendor verification?{' '}
              <a href="/register" className="text-emerald-400 font-semibold hover:underline">
                Apply for Account →
              </a>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Sign In</h3>
              <p className="text-xs text-slate-500 mt-1">Enter your registered business email and security credential.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => {
                      setGmail(e.target.value);
                      clearFieldError('gmail');
                    }}
                    placeholder="vendor@company.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm focus:outline-none transition ${
                      fieldErrors.gmail
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.gmail && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.gmail}
                  </p>
                )}
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
                    className="text-xs text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    Forgot passkey?
                  </button>
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    placeholder="Enter password or security passkey"
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border text-sm focus:outline-none transition ${
                      fieldErrors.password
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Sign In CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
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
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
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
