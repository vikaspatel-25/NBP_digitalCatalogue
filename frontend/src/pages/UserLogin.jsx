import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, KeyRound, X } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 font-sans text-slate-800">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <a href="/home" className="inline-flex items-center justify-center gap-2.5 group no-underline" title="Go to NetZeroMart Storefront">
            <img 
              src="/assets/netZeroStickerIcon.png" 
              alt="NetZeroMart" 
              className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              NetZeroMart
            </span>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs">
          <div className="text-center mb-5">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">Vendor Sign In</h1>
            <p className="text-xs text-slate-500 mt-0.5">Access your vendor catalogue portal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  required
                  placeholder="contact@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password or Temporary Passkey
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setForgotModal(true); setForgotEmail(gmail); }}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition"
              >
                Forgot passkey?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition active:scale-98 shadow-2xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Vendor Panel</span>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New vendor?{' '}
              <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                Register company account →
              </a>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <a href="/home" className="inline-flex items-center gap-1 hover:text-slate-900 transition font-medium">
              <ArrowLeft size={13} />
              <span>Storefront</span>
            </a>
            <a href="/adminLogin" className="text-slate-600 hover:text-slate-900 font-medium transition">
              Admin Portal
            </a>
          </div>
        </div>
      </div>

      {/* Forgot Passkey Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <KeyRound size={16} className="text-emerald-600" />
                <span>Recover Vendor Passkey</span>
              </div>
              <button
                onClick={() => { setForgotModal(false); setForgotMessage(''); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter your registered vendor email to receive your account passkey.
            </p>

            {forgotMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasskey} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="contact@company.com"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setForgotModal(false); setForgotMessage(''); }}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
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
