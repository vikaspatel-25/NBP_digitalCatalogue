import React, { useState } from 'react';
import axios from 'axios';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  Award, 
  ArrowRight 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    userName: '',
    mobile: '',
    email: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);

  const clearFieldError = (name) => {
    setFieldErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el.focus) el.focus();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
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
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Verification document exceeds 10MB limit. Please upload a smaller file.', { title: 'File Too Large' });
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview('');
      }
      toast.info(`Document "${selectedFile.name}" selected.`, { title: 'Document Attached' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field-level active validations
    const errors = {};
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (!formData.userName.trim()) {
      errors.userName = 'Contact person / representative name is required';
    }
    const cleanPhone = formData.mobile.replace(/[^0-9]/g, '');
    if (!formData.mobile.trim() || cleanPhone.length < 10) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Please enter a valid business email address';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      toast.error(errors[firstKey], { title: 'Required Field Incomplete' });
      scrollToElement(`reg-${firstKey}`);
      return;
    }

    if (emailWarning) {
      toast.error(emailWarning, { title: 'Email Unavailable' });
      scrollToElement('reg-email');
      return;
    }

    setLoading(true);
    const emailTrimmed = formData.email.trim().toLowerCase();

    const isEmailValid = await checkEmail(emailTrimmed);
    if (!isEmailValid) {
      const blockedMsg = emailWarning || 'This email address is already in use by a registered vendor or pending application.';
      setError(blockedMsg);
      toast.error(blockedMsg, { title: 'Email Already Registered' });
      setLoading(false);
      scrollToElement('reg-email');
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
        toast.success('Your vendor application was submitted successfully! Our team will review your profile.', { title: 'Application Received' });
      } else {
        const errText = res.data?.error || res.data?.message || 'Failed to submit registration.';
        setError(errText);
        toast.error(errText, { title: 'Registration Failed' });
        if (errText.toLowerCase().includes('email') || errText.toLowerCase().includes('vendor') || errText.toLowerCase().includes('application')) {
          setEmailWarning(errText);
          setFieldErrors(prev => ({ ...prev, email: errText }));
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '');
      const finalErr = serverError || 'Failed to submit registration. Please verify all fields.';
      setError(finalErr);
      toast.error(finalErr, { title: 'Submission Error' });
      if (finalErr.toLowerCase().includes('email') || finalErr.toLowerCase().includes('vendor') || finalErr.toLowerCase().includes('application')) {
        setEmailWarning(finalErr);
        setFieldErrors(prev => ({ ...prev, email: finalErr }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Thank you for applying to NetZeroMart. Your application has been logged and our compliance team has been notified.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Company:</span>
              <span className="font-semibold text-slate-800">{formData.companyName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Contact:</span>
              <span className="font-semibold text-slate-800">{formData.userName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Registered Email:</span>
              <span className="font-semibold text-slate-800">{formData.email}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Upon approval, you will receive an onboarding notification with your portal passkey to finalize subscription settings.
          </p>

          <a
            href="/"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
          >
            Return to Storefront
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>Verified Vendor Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Register Your Sustainable Enterprise
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Showcase your clean-tech innovations, industrial solar solutions, and green equipment to verified institutional buyers.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Hero Sidebar */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 sm:p-10 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base">
                  NZ
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide">NetZeroMart</div>
                  <div className="text-[10px] text-slate-400">Digital Catalogue & Directory</div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <h3 className="text-lg font-bold leading-snug">
                  Transform Buyer Inquiries into Direct Enterprise Contracts
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join a network of audited manufacturers, green suppliers, and circular economy service providers.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold text-white">Full Digital Catalogue:</span> Upload 25 to 75 products/month with spec sheets and video demos.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold text-white">Transparent Annual Plans:</span> Fixed yearly billing at ₹1,200 or ₹2,400 via corporate bank transfer or UPI.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold text-white">Editorial Exposure:</span> Publish case studies and articles linked directly to your products.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-700/60 mt-8 text-[11px] text-slate-400">
              Already verified? <a href="/userLogin" className="text-blue-400 font-bold hover:underline">Sign In to Vendor Portal →</a>
            </div>
          </div>

          {/* Right Form Body */}
          <div className="md:col-span-7 p-6 sm:p-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="reg-companyName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-companyName"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. EcoGrid Technologies Ltd."
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none transition ${
                      fieldErrors.companyName 
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.companyName && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-userName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Representative / Contact Person Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-userName"
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Chandra"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none transition ${
                      fieldErrors.userName 
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.userName && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.userName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-mobile" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile / Business Phone *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-mobile"
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none transition font-mono ${
                      fieldErrors.mobile 
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.mobile && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.mobile}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Official Business Email *
                  </label>
                  {emailChecking && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Verifying...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={(e) => checkEmail(e.target.value)}
                    placeholder="e.g. contact@ecogrid.in"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none transition ${
                      emailWarning || fieldErrors.email
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                    }`}
                  />
                </div>

                {emailWarning && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-start gap-1">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{emailWarning}</span>
                  </p>
                )}
                {!emailWarning && fieldErrors.email && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Document upload */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company Verification Proof (GST / Registration Certificate / Brochure)
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Upload size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {file ? file.name : 'Upload GSTIN or Corporate Certificate'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, PNG, JPG up to 10MB'}
                        </div>
                      </div>
                    </div>
                    
                    <label className="cursor-pointer px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition border border-slate-200 shadow-2xs shrink-0">
                      <span>{file ? 'Change File' : 'Browse File'}</span>
                      <input 
                        type="file" 
                        name="document" 
                        onChange={handleFileChange} 
                        accept="image/*,application/pdf"
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {filePreview && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                      <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      <span className="text-xs text-slate-600">Document ready for upload</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application for Verification</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                By submitting, you agree to our <a href="/terms" className="text-slate-700 hover:underline">Terms</a> and <a href="/privacy" className="text-slate-700 hover:underline">Privacy Policy</a>.
              </p>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
