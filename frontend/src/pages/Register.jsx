import React, { useState } from 'react';
import axios from 'axios';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    companyName: '',
    userName: '',
    mobile: '',
    email: '',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const checkEmail = async (emailToCheck) => {
    const trimmed = (emailToCheck !== undefined ? emailToCheck : formData.email).trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailWarning('');
      return true;
    }
    setEmailChecking(true);
    try {
      const res = await axios.get(`/api/register/check-email?email=${encodeURIComponent(trimmed)}`);
      if (res.data && res.data.available === false) {
        const msg = res.data.error || res.data.message || 'This email address is already registered or awaiting approval.';
        setEmailWarning(msg);
        return false;
      }
      setEmailWarning('');
      return true;
    } catch (e) {
      const serverMsg = e.response?.data?.error || e.response?.data?.message;
      if (e.response?.status === 400 && serverMsg) {
        setEmailWarning(serverMsg);
        return false;
      }
      return true;
    } finally {
      setEmailChecking(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailTrimmed = formData.email.trim().toLowerCase();

    // 1. Strict pre-submission check: Verify if email is already taken
    const isEmailValid = await checkEmail(emailTrimmed);
    if (!isEmailValid) {
      const blockedMsg = emailWarning || 'This email address is already in use by a registered vendor or pending application.';
      setError(blockedMsg);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const data = new FormData();
      data.append('companyName', formData.companyName.trim());
      data.append('userName', formData.userName.trim());
      data.append('mobile', formData.mobile.trim());
      data.append('email', emailTrimmed);
      if (file) {
        data.append('document', file);
      }

      const res = await axios.post('/api/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSubmitted(true);
      } else {
        const errText = res.data?.error || res.data?.message || 'Failed to submit registration.';
        setError(errText);
        if (errText.toLowerCase().includes('email') || errText.toLowerCase().includes('vendor') || errText.toLowerCase().includes('application')) {
          setEmailWarning(errText);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '');
      const finalErr = serverError || 'Failed to submit registration. Please verify all fields.';
      setError(finalErr);
      if (finalErr.toLowerCase().includes('email') || finalErr.toLowerCase().includes('vendor') || finalErr.toLowerCase().includes('application')) {
        setEmailWarning(finalErr);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Thank you for applying to join <strong>NetZeroMart</strong>. Our administrative team will review your business credentials and email your access credentials upon approval.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-6 text-left text-xs text-slate-600 space-y-1">
            <p><strong>Company:</strong> {formData.companyName}</p>
            <p><strong>Applicant:</strong> {formData.userName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <a href="/home" className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm">
              Return to Storefront
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ companyName: '', userName: '', mobile: '', email: '' });
                setFile(null);
                setFilePreview('');
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
            >
              Register Another Company
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-7">
        <a href="/home" className="inline-flex items-center justify-center gap-2.5 mb-2.5 group no-underline" title="Go to NetZeroMart Storefront">
          <img 
            src="/assets/netZeroStickerIcon.png" 
            alt="NetZeroMart" 
            className="w-9 h-9 object-contain shrink-0 group-hover:scale-105 transition-transform" 
          />
          <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none select-none">
            NetZeroMart
          </span>
        </a>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          Vendor & Partner Registration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Join the NetZeroMart sustainable commerce network and showcase your green solutions.
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-rose-500" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company / Business Name *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 size={18} />
              </div>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. GreenTech Energy Innovations Pvt Ltd"
                className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Person / Representative Name *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                placeholder="e.g. Vikram Sharma"
                className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Mobile & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email Address *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => { handleChange(e); setEmailWarning(''); }}
                  onBlur={(e) => checkEmail(e.target.value)}
                  required
                  placeholder="contact@company.com"
                  className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    emailWarning ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
                  } text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition`}
                />
              </div>
              {emailChecking && (
                <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <Loader2 size={13} className="animate-spin text-slate-400 shrink-0" />
                  <span>Verifying email availability...</span>
                </p>
              )}
              {emailWarning && !emailChecking && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{emailWarning}</span>
                </p>
              )}
            </div>
          </div>

          {/* Company Document Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Brochure or Verification Document (PDF/Image)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center transition bg-slate-50/50">
              <input
                type="file"
                id="docUpload"
                onChange={handleFileChange}
                accept=".pdf,image/*"
                className="hidden"
              />
              <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center justify-center">
                {file ? (
                  <div className="flex items-center gap-3 text-slate-800 font-medium text-sm">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 rounded object-cover border border-slate-200" />
                    ) : (
                      <FileText size={28} className="text-blue-600" />
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-xs text-slate-800 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-blue-600 hover:underline">Click to upload document</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl text-blue-900 text-xs">
            <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
            <span>Your business details are strictly kept confidential and verified by NetZeroMart administration.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition active:scale-98 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Submitting Registration...</span>
              </>
            ) : (
              <span>Submit Registration Application</span>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <a href="/home" className="inline-flex items-center gap-1 hover:text-blue-600 font-medium">
            <ArrowLeft size={14} /> Back to Storefront
          </a>
          <a href="/userLogin" className="font-semibold text-blue-600 hover:underline">
            Already approved? Vendor Login →
          </a>
        </div>
      </div>
    </div>
  );
}
