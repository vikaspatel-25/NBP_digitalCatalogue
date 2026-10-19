import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  KeyRound,
  X,
  Lock,
  FileText,
  ExternalLink,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { TERMS_AND_CONDITIONS } from '../data/termsData';

export default function Register() {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    userName: '',
    mobile: '',
    email: '',
    agreeTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [termsModal, setTermsModal] = useState(false);

  // Email Verification OTP State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [pendingSubmitAfterOtp, setPendingSubmitAfterOtp] = useState(false);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);
    setError('');

    if (name === 'email') {
      if (isEmailVerified && value.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
        setIsEmailVerified(false);
      }
    }
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

  const handleRequestOtp = async (isForSubmission = false) => {
    const emailTrimmed = formData.email.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid business email address' }));
      toast.error('Please enter a valid business email address before requesting verification.', { title: 'Email Required' });
      scrollToElement('reg-email');
      return;
    }

    setOtpSending(true);
    setOtpError('');

    try {
      // First verify email is not reserved or taken
      const isAvailable = await checkEmail(emailTrimmed);
      if (!isAvailable) {
        toast.error(emailWarning || 'This email address is already in use.', { title: 'Email Unavailable' });
        setOtpSending(false);
        return;
      }

      const res = await axios.post('/api/register/send-otp', {
        email: emailTrimmed,
        userName: formData.userName.trim(),
        companyName: formData.companyName.trim()
      });

      if (res.data?.success) {
        setOtpModal(true);
        setPendingSubmitAfterOtp(isForSubmission);
        setOtpCooldown(60);
        setOtp('');
        toast.info(`A 6-digit verification code has been dispatched to ${emailTrimmed}.`, { title: 'Verification Code Dispatched' });
      } else {
        toast.error(res.data?.error || 'Failed to send verification code.', { title: 'Request Failed' });
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error dispatching verification code.';
      setOtpError(msg);
      toast.error(msg, { title: 'Dispatch Error' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      toast.error('Please enter the complete 6-digit verification code.', { title: 'Code Incomplete' });
      return;
    }

    setOtpVerifying(true);
    setOtpError('');

    try {
      const emailTrimmed = formData.email.trim().toLowerCase();
      const res = await axios.post('/api/register/verify-otp', {
        email: emailTrimmed,
        otp: cleanOtp
      });

      if (res.data?.success) {
        setIsEmailVerified(true);
        setVerifiedEmail(emailTrimmed);
        setOtpModal(false);
        toast.success('Business email verified successfully!', { title: 'Email Confirmed' });

        if (pendingSubmitAfterOtp) {
          await doSubmitRegistration(cleanOtp);
        }
      } else {
        const errText = res.data?.error || 'Invalid or expired verification code.';
        setOtpError(errText);
        toast.error(errText, { title: 'Verification Failed' });
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      const errText = err.response?.data?.error || err.response?.data?.message || 'Invalid or expired verification code.';
      setOtpError(errText);
      toast.error(errText, { title: 'Verification Failed' });
    } finally {
      setOtpVerifying(false);
    }
  };

  const doSubmitRegistration = async (optionalOtp) => {
    setLoading(true);
    setError('');
    const emailTrimmed = formData.email.trim().toLowerCase();

    try {
      const data = new FormData();
      data.append('companyName', formData.companyName.trim());
      data.append('userName', formData.userName.trim());
      data.append('mobile', formData.mobile.trim());
      data.append('email', emailTrimmed);
      data.append('agreeTerms', formData.agreeTerms ? 'true' : 'false');
      data.append('termsAccepted', formData.agreeTerms ? 'true' : 'false');
      if (optionalOtp || otp) {
        data.append('otp', optionalOtp || otp);
      }
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const serverError = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '');
      const finalErr = serverError || 'Failed to submit registration. Please verify all fields.';
      setError(finalErr);
      toast.error(finalErr, { title: 'Submission Error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
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
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must review and accept the Copyright Policy and Terms & Conditions before submitting your application.';
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

    const emailTrimmed = formData.email.trim().toLowerCase();

    // Enforce email verification before submitting
    if (!isEmailVerified || emailTrimmed !== verifiedEmail.toLowerCase()) {
      toast.warning('Email verification is required before submitting your application. We are sending a 6-digit code to your email.', { title: 'Verification Required' });
      await handleRequestOtp(true);
      return;
    }

    // Already verified: proceed directly with submission
    await doSubmitRegistration();
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
                  <div className="flex items-center gap-2">
                    {emailChecking && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Loader2 size={11} className="animate-spin" /> Checking...
                      </span>
                    )}
                    {isEmailVerified && formData.email.trim().toLowerCase() === verifiedEmail.toLowerCase() ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      formData.email.includes('@') && !emailWarning && (
                        <button
                          type="button"
                          onClick={() => handleRequestOtp(false)}
                          disabled={otpSending}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {otpSending ? 'Dispatching OTP...' : 'Verify Email'}
                        </button>
                      )
                    )}
                  </div>
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
                        : isEmailVerified && formData.email.trim().toLowerCase() === verifiedEmail.toLowerCase()
                        ? 'border-emerald-300 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
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

              {/* Terms and Conditions Acceptance Card */}
              <div
                id="reg-agreeTerms"
                className={`p-4 rounded-2xl border transition-all ${
                  fieldErrors.agreeTerms
                    ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200'
                    : formData.agreeTerms
                    ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="checkbox-agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({ ...prev, agreeTerms: checked }));
                      if (checked) {
                        clearFieldError('agreeTerms');
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed select-none flex-1">
                    <label htmlFor="checkbox-agreeTerms" className="cursor-pointer font-medium">
                      I have read, understood, and accept the{' '}
                    </label>
                    <button
                      type="button"
                      onClick={() => setTermsModal(true)}
                      className="font-bold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Copyright Policy &amp; Terms &amp; Conditions</span>
                      <ExternalLink size={12} className="inline ml-0.5" />
                    </button>
                    <label htmlFor="checkbox-agreeTerms" className="cursor-pointer font-medium">
                      {' '}for third-party sellers, products, and services on NetZeroMart.
                    </label>
                  </div>
                </div>

                {fieldErrors.agreeTerms && (
                  <div className="mt-2 text-[11px] text-rose-600 font-semibold flex items-center gap-1.5 pl-7 animate-in fade-in">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.agreeTerms}</span>
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 pl-7">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck size={13} className="text-blue-600" />
                    <span>17 Compliance Clauses (Intellectual Property, Licensing, Warranties)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTermsModal(true)}
                    className="text-blue-600 font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Read Policy Details →
                  </button>
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

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Protected by 256-bit encryption &amp; Verified Vendor Onboarding</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Email Verification OTP Modal */}
      {otpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setOtpModal(false);
                setOtpError('');
                setPendingSubmitAfterOtp(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Verify Your Business Email</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Enter the 6-digit verification code sent to <strong className="text-slate-800">{formData.email.trim()}</strong> to confirm ownership and submit your vendor application.
            </p>

            {otpError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  6-Digit Verification Code *
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
                      setOtp(e.target.value.replace(/[^0-9]/g, ''));
                      setOtpError('');
                    }}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 px-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Didn't receive the email?</span>
                {otpCooldown > 0 ? (
                  <span className="text-slate-400 font-medium">Resend in {otpCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp(pendingSubmitAfterOtp)}
                    disabled={otpSending}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    {otpSending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={otpVerifying || otp.length < 6}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {otpVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Email...</span>
                    </>
                  ) : (
                    <>
                      <span>{pendingSubmitAfterOtp ? 'Verify & Submit Application' : 'Confirm Email Verification'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Terms & Conditions Modal */}
      {termsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    COPYRIGHT POLICY &amp; TERMS &amp; CONDITIONS
                  </h3>
                  <p className="text-xs text-slate-500">
                    For Third-Party Sellers, Products and Services • 17 Clauses
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTermsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Terms Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[60vh]">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <p>
                  Please review all 17 clauses carefully. By clicking &quot;Accept &amp; Continue&quot;, you confirm that your enterprise holds all necessary intellectual property rights, licenses, and authority to list products and services on NetZeroMart.
                </p>
              </div>

              {TERMS_AND_CONDITIONS.map((clause) => (
                <div key={clause.id} className="space-y-2 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white inline-flex items-center justify-center text-[11px] font-bold shrink-0">
                      {clause.id}
                    </span>
                    <span>{clause.title.replace(/^\d+\.\s*/, '')}</span>
                  </h4>

                  {clause.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {clause.bulletTitle && (
                    <p className="font-semibold text-slate-800 text-xs pt-1">
                      {clause.bulletTitle}
                    </p>
                  )}

                  {clause.bullets && (
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-[13px]">
                      {clause.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {clause.contactInfo && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 my-2">
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        {clause.contactInfo.title}
                      </div>
                      <div>
                        <span className="text-slate-500">Email:</span>{' '}
                        <a href={`mailto:${clause.contactInfo.email}`} className="text-blue-600 font-bold hover:underline">
                          {clause.contactInfo.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500">Subject:</span>{' '}
                        <span className="font-medium text-slate-700">{clause.contactInfo.subject}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 order-2 sm:order-1"
              >
                <span>Open in Full Page</span>
                <ExternalLink size={12} />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setTermsModal(false)}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, agreeTerms: true }));
                    clearFieldError('agreeTerms');
                    setTermsModal(false);
                    toast.success('Terms & Conditions accepted!', { title: 'Compliance Confirmed' });
                  }}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle size={14} />
                  <span>Accept &amp; Continue</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
