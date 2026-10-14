import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  QrCode,
  Save,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Info,
  Building,
  Mail,
  Phone,
  FileText,
  CreditCard
} from 'lucide-react';

export default function AdminPaymentSettings() {
  const [formData, setFormData] = useState({
    upiId: '',
    upiName: '',
    contactEmail: '',
    contactPhone: '',
    notes: ''
  });
  const [currentQr, setCurrentQr] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorToast('');
    try {
      const res = await axios.get('/api/admin/payment-settings');
      if (res.data?.success && res.data.settings) {
        const s = res.data.settings;
        setFormData({
          upiId: s.upiId || '',
          upiName: s.upiName || '',
          contactEmail: s.contactEmail || '',
          contactPhone: s.contactPhone || '',
          notes: s.notes || ''
        });
        setCurrentQr(s.qrCode?.url || '');
      }
    } catch (err) {
      console.error(err);
      setErrorToast(err.response?.data?.error || 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyUpi = () => {
    if (formData.upiId) {
      navigator.clipboard.writeText(formData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessToast('');
    setErrorToast('');

    try {
      const data = new FormData();
      data.append('upiId', formData.upiId);
      data.append('upiName', formData.upiName);
      data.append('contactEmail', formData.contactEmail);
      data.append('contactPhone', formData.contactPhone);
      data.append('notes', formData.notes);

      if (selectedFile) {
        data.append('qrCode', selectedFile);
      }

      const res = await axios.post('/api/admin/payment-settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccessToast('UPI and QR payment settings updated successfully!');
        if (res.data.settings?.qrCode?.url) {
          setCurrentQr(res.data.settings.qrCode.url);
          setSelectedFile(null);
          setFilePreview('');
        }
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        setErrorToast(res.data?.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      setErrorToast(err.response?.data?.error || 'Network error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}
      {errorToast && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorToast}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Corporate UPI & QR Code Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure the corporate UPI ID and QR code where vendors will transfer annual subscriptions.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading payment configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Receiving UPI Account Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  UPI ID (VPA) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="Enter UPI ID (e.g. company@bank)"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                  />
                  {formData.upiId && (
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition"
                      title="Copy UPI ID"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Vendors will transfer money directly to this UPI address.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Beneficiary / Payee Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.upiName}
                  onChange={(e) => setFormData({ ...formData, upiName: e.target.value })}
                  placeholder="Enter Beneficiary / Company Account Title"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[11px] text-slate-400 mt-1">Official bank account title shown to vendors.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accounts / Invoicing Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Enter Accounts Email"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accounts Support Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Enter Accounts Phone / WhatsApp"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vendor Payment Instructions & Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Instructions displayed to vendors on the subscription payment screen..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Payment Settings'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: QR Code Image Upload & Live Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4 flex flex-col items-center text-center">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 w-full text-left border-b border-slate-100 pb-3">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Official QR Code</span>
            </h2>

            {/* QR Preview Box */}
            <div className="w-56 h-56 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-2 relative group">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="QR Code Preview"
                  className="w-full h-full object-contain"
                />
              ) : currentQr ? (
                <img
                  src={currentQr}
                  alt="Current Official QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <QrCode className="w-12 h-12 stroke-[1.2]" />
                  <span>No QR Code Uploaded</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              <label
                htmlFor="qrUploadInput"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>{filePreview || currentQr ? 'Upload New QR Image' : 'Select QR Image'}</span>
              </label>
              <input
                id="qrUploadInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP. High resolution recommended for seamless smartphone scanning.
              </p>
            </div>

            {/* Quick Live Preview Card */}
            <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-left text-xs space-y-1 mt-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Vendor Scan Preview</div>
              <div className="font-semibold text-slate-800 truncate">{formData.upiName || 'Not configured yet'}</div>
              <div className="font-mono text-slate-600 text-[11px] truncate">{formData.upiId || 'Not configured yet'}</div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
