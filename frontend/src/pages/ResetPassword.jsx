import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ResetPassword({ role = 'admin' }) {
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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
    if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'New password and confirmation password do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstMsg = Object.values(errors)[0];
      toast.error(firstMsg, { title: 'Validation Warning' });
      return;
    }

    setLoading(true);
    const endpoint = role === 'admin' ? '/admin/resetPassword' : '/userPanel/resetPassword';

    try {
      const res = await axios.post(endpoint, { confirmPassword: newPassword }, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        }
      });

      if (res.data?.success) {
        toast.success('Password updated successfully! Redirecting...', { title: 'Password Changed' });
        setTimeout(() => {
          window.location.href = role === 'admin' ? '/adminLogin' : '/userLogin';
        }, 1200);
      } else {
        const msg = res.data?.error || 'Failed to update password.';
        setError(msg);
        toast.error(msg, { title: 'Update Failed' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Failed to update password. Please check your session.');
      setError(errorMsg);
      toast.error(errorMsg, { title: 'Update Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Lock size={13} />
            <span>Account Security</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Change Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Update your authentication credentials for secure portal access.
          </p>
        </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearFieldError('newPassword');
                }}
                placeholder="Minimum 6 characters"
                className={`block w-full px-3.5 pr-10 py-2.5 text-sm rounded-xl border transition ${
                  fieldErrors.newPassword 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Re-enter your new password"
                className={`block w-full px-3.5 pr-10 py-2.5 text-sm rounded-xl border transition ${
                  fieldErrors.confirmPassword 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              Changing your password will invalidate active sessions and require signing in with the new credentials.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Save New Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
