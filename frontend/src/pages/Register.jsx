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
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Store,
  Leaf,
  Layers,
  Award,
  ArrowRight
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Received</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your registration has been submitted for verification. Upon administrative review, we will email your passkey to <span className="text-emerald-400 font-semibold">{formData.email}</span> along with your complimentary <strong>28-day free trial</strong>.
          </p>
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 mb-6 text-left text-xs text-slate-300 space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Company:</span> <span className="font-semibold text-white">{formData.companyName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Representative:</span> <span>{formData.userName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Trial Period:</span> <span className="text-emerald-400 font-bold">28 Days Free</span></div>
          </div>
          <div className="flex flex-col gap-3">
            <a href="/home" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-900/30">
              Return to Storefront
            </a>
            <a href="/userLogin" className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
              Already have an approved account? Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <a href="/home" className="inline-flex items-center gap-2.5 group no-underline">
            <img 
              src="/assets/netZeroStickerIcon.png" 
              alt="NetZeroMart" 
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              NetZero<span className="text-emerald-400">Mart</span>
            </span>
          </a>
          <a 
            href="/userLogin" 
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <span>Existing Vendor?</span>
            <span className="text-emerald-400 underline">Sign In</span>
          </a>
        </div>

        {/* Side-by-Side Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          
          {/* Left Column: Visual Brand Pitch & Value Pillars */}
          <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6">
                <Sparkles size={13} />
                <span>Verified Supplier Directory</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                List Your Green Innovations for Buyers Worldwide.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Connect directly with enterprise sustainability officers, green architects, and industrial procurement teams seeking vetted decarbonization solutions.
              </p>

              {/* Value Props */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                    <Award size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Complimentary 28-Day Free Trial</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      New verified suppliers get 28 full days of catalogue exposure at zero cost.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/20">
                    <Store size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Full Digital Catalogue</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Publish products with multi-image carousels, spec sheets, and video demonstrations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/20">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Zero Auto-Debit Surprises</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Renewals are 100% manual via instant UPI for just ₹49/28 days or ₹499/year.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom mini testimonial / guarantee */}
            <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>SSL Encrypted Submission</span>
              </div>
              <a href="/pricing" className="text-emerald-400 hover:underline">View Pricing Plans →</a>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Submit Vendor Application
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your company information below to start your verification process.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle size={18} className="flex-shrink-0 text-rose-400 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. EcoMatrix Technologies Pvt Ltd"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Representative Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Authorized Representative Name *
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rahul Mehta"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Mobile & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Business Email *
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => checkEmail()}
                      required
                      placeholder="vendor@company.com"
                      className={`w-full pl-11 pr-9 py-3 rounded-xl bg-slate-950/80 border text-white placeholder-slate-500 text-sm focus:outline-none transition ${
                        emailWarning ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                    {emailChecking && (
                      <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                    )}
                  </div>
                  {emailWarning && (
                    <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{emailWarning}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Business Certificate Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Business Registration / GST Certificate (Optional)
                </label>
                <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 hover:border-slate-600 transition">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0">
                        <Upload size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {file ? file.name : 'Upload GST, Certificate, or Brochure'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, PNG, JPG up to 10MB'}
                        </div>
                      </div>
                    </div>
                    
                    <label className="cursor-pointer px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition border border-slate-700 shrink-0">
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
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                      <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                      <span className="text-xs text-slate-400">Document ready for upload</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || Boolean(emailWarning)}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application & Claim Free Trial</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                By submitting, you agree to our <a href="/terms" className="text-slate-400 hover:text-white underline">Terms</a> and <a href="/privacy" className="text-slate-400 hover:text-white underline">Privacy Policy</a>.
              </p>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
