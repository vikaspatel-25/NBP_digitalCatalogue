import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Building2, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

export default function UserLogin() {
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct post to user login
      await axios.post('/userLogin', { gmail, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/userPanel';
    } catch (err) {
      console.error('Vendor login error:', err);
      // Fallback: standard form submit to /userLogin
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
        setError(err.response?.data?.error || err.response?.data || 'Invalid email or password. Please verify your credentials.');
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
      setForgotMessage('Your temporary passkey has been dispatched to your registered email address.');
    } catch (err) {
      setForgotMessage(err.response?.data || 'Could not find a registered account with this email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      {/* Brand Header with Pixel-Perfect Alignment */}
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <a href="/home" className="flex items-center justify-center gap-3 mb-3 group no-underline">
          <img 
            src="/assets/netZeroStickerIcon.png" 
            alt="NetZeroMart" 
            className="w-11 h-11 object-contain transition-transform group-hover:scale-105" 
          />
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white select-none">
            NetZeroMart
          </span>
        </a>
        <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-xs">
          <Building2 size={14} className="flex-shrink-0" />
          <span>Vendor & Partner Portal</span>
        </div>
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-10">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email and password or temporary passkey.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Registered Email
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                required
                placeholder="contact@company.com"
                className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password or Temporary Passkey
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setForgotModal(true); setForgotEmail(gmail); }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Forgot Passkey?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to Vendor Panel</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <a href="/home" className="inline-flex items-center gap-1.5 hover:text-slate-900 font-semibold text-slate-600 transition">
            <ArrowLeft size={14} /> <span>Back to Storefront</span>
          </a>
          <a href="/register" className="text-emerald-700 hover:text-emerald-800 font-bold transition">
            New partner? Register here →
          </a>
        </div>
      </div>

      {/* Forgot Passkey Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Recover Vendor Passkey</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered vendor email to receive your account passkey.
            </p>

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasskey} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="contact@company.com"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setForgotModal(false); setForgotMessage(''); }}
                  className="w-1/2 py-2.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-1/2 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? 'Sending...' : 'Send Passkey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
