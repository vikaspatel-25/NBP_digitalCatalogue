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
  Sparkles,
  ArrowRight,
  Zap,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminLogin() {
  const { toast } = useToast();

  const [step, setStep] = useState('password'); // 'password' | 'otp'
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Forgot Passkey Modal
  const [forgotModal, setForgotModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

    if (!password.trim()) {
      setFieldErrors({ password: 'Administrator security passkey is required' });
      toast.error('Please enter the administrator master passkey.', { title: 'Passkey Required' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/adminLogin', { password: password.trim() }, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (res.data?.requireOtp) {
        setStep('otp');
        setMaskedEmail(res.data.maskedEmail || 'authorized admin email');
        setOtp('');
        setResendCooldown(60);
        toast.info(res.data.message || 'Verification code sent to your email.', { title: 'Verification Code Sent' });
        setLoading(false);
        return;
      }

      toast.success('Admin authorization verified! Redirecting to console...', { title: 'Authorized' });
      window.location.href = res.data?.redirectUrl || '/admin';
    } catch (err) {
      console.error('Admin login error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : '');
      const finalMsg = serverMsg || 'Invalid master passkey or unauthorized access attempt.';
      setError(finalMsg);
      setFieldErrors({ password: finalMsg });
      toast.error(finalMsg, { title: 'Access Denied' });
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setFieldErrors({ otp: 'Please enter the complete 6-digit verification code' });
      toast.error('Please enter the 6-digit code sent to your email.', { title: 'Code Incomplete' });
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axios.post('/adminLogin/verify-otp', { otp: cleanOtp }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      toast.success('Admin authorization verified! Redirecting to console...', { title: 'Authorized' });
      window.location.href = res.data?.redirectUrl || '/admin';
    } catch (err) {
      console.error('OTP verification error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || 'Invalid or expired verification code.';
      setError(serverMsg);
      setFieldErrors({ otp: serverMsg });
      toast.error(serverMsg, { title: 'Verification Failed' });
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await axios.post('/adminLogin/resend-otp');
      toast.success(res.data?.message || 'A fresh verification code was sent to your email.', { title: 'Code Dispatched' });
      setResendCooldown(60);
      setError('');
      setFieldErrors({});
    } catch (err) {
      toast.error('Failed to resend code. Please try again.', { title: 'Resend Failed' });
    }
  };

  const handleForgotPasskey = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      toast.warning('Please enter the designated administrator email address.');
      return;
    }
    setForgotLoading(true);
    setForgotMessage('');
    try {
      await axios.get(`/admin/forgotPassword?gmail=${encodeURIComponent(adminEmail.trim())}`);
      const successMsg = 'Passkey recovery instructions have been dispatched to your administrator email.';
      setForgotMessage(successMsg);
      toast.success(successMsg, { title: 'Passkey Dispatched' });
    } catch (err) {
      const errMsg = err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Failed to dispatch passkey. Ensure email is the authorized admin email.');
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
              NetZero<span className="text-blue-700">Mart</span>
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
          <div className="md:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                <LayoutDashboard size={13} />
                <span>Administration Console</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                  Master Control & Governance
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Restricted access environment for NetZeroMart directory operations, vendor verification, offline UPI payment reconciliations, and catalogue moderation.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Vendor compliance verification & approval</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Manual UTR transaction auditing and renewal activation</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Platform-wide UPI ID & QR payment settings</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-xs text-slate-400">
              Looking for vendor portal?{' '}
              <a href="/userLogin" className="text-blue-400 font-semibold hover:underline">
                Vendor Sign In →
              </a>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            {step === 'password' ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Admin Authentication</h3>
                  <p className="text-xs text-slate-500 mt-1">Provide your master administrative credentials to continue.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                        className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
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
                        placeholder="Enter security passkey"
                        className={`w-full pl-11 pr-11 py-3 rounded-xl border text-sm focus:outline-none transition ${
                          fieldErrors.password
                            ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                            : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
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
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Passkey & Request OTP</span>
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
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck size={13} />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Enter Verification Code</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    A 6-digit one-time authorization code has been dispatched to <strong className="text-slate-800">{maskedEmail}</strong>.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      6-Digit Security OTP Code *
                    </label>

                    <div className="relative">
                      <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        autoFocus
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setOtp(val);
                          clearFieldError('otp');
                          setError('');
                        }}
                        placeholder="••••••"
                        className={`w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 px-10 rounded-xl border focus:outline-none transition ${
                          fieldErrors.otp
                            ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                            : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                        }`}
                      />
                    </div>
                    {fieldErrors.otp && (
                      <p className="text-xs text-rose-600 font-medium mt-1 text-center flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> {fieldErrors.otp}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Didn't receive the email?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-slate-400 font-medium">Resend code in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* Verify CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={otpLoading || otp.length < 6}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Authorizing Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Enter Admin Console</span>
                          <ShieldCheck size={16} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('password');
                        setError('');
                        setFieldErrors({});
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      ← Back to Passkey
                    </button>
                  </div>
                </form>
              </>
            )}
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
