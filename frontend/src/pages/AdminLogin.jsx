import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, Shield, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Post to login endpoint
      const res = await axios.post('/adminLogin', { password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      // If successful, redirect to admin
      window.location.href = '/admin';
    } catch (err) {
      console.error('Admin login error:', err);
      // Fallback: standard form submit to /adminLogin
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
      const res = await axios.get(`/admin/forgotPassword?gmail=${encodeURIComponent(adminEmail)}`);
      setForgotMessage('Passkey recovery instructions have been sent to your administrator email.');
    } catch (err) {
      setForgotMessage(err.response?.data || 'Failed to dispatch passkey. Ensure email is the authorized admin email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <a href="/home" className="inline-flex items-center gap-3 mb-3 group">
          <img src="/assets/netZeroStickerIcon.png" alt="NetZeroMart" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          <img src="/assets/netZeroText.png" alt="NetZeroMart" className="h-7 w-auto object-contain brightness-0 invert" />
        </a>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
          <Shield size={14} /> System Administrator
        </div>
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Sign In</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Enter your master password or security passkey.</p>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password or Passkey
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setForgotModal(true)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Forgot Passkey?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Unlock Admin Panel</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <a href="/home" className="inline-flex items-center gap-1 hover:text-slate-800 font-medium">
            <ArrowLeft size={14} /> Back to Storefront
          </a>
          <a href="/userLogin" className="text-blue-600 font-semibold hover:underline">
            Vendor Sign In →
          </a>
        </div>
      </div>

      {/* Forgot Passkey Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Recover Admin Passkey</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the authorized administrator Gmail address to receive the active recovery passkey.
            </p>

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasskey} className="space-y-4">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="netzeromart@gmail.com"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setForgotModal(false); setForgotMessage(''); }}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
