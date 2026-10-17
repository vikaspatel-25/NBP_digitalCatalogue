import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sliders,
  Image as ImageIcon,
  Video,
  Film,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminMediaSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    allowImages: true,
    allowVideos: true,
    allowYoutube: true,
    maxImagesPerProduct: 10,
    maxImageSizeMb: 10,
    maxVideosPerProduct: 2,
    maxVideoSizeMb: 15,
    maxVideoDurationSeconds: 30,
    articleMaxCoverSizeMb: 10,
    contactEmail: '',
    contactPhone: '',
    customPlanNote: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/media-settings');
      if (res.data?.success && res.data.settings) {
        const s = res.data.settings;
        setFormData({
          allowImages: s.allowImages !== undefined ? s.allowImages : true,
          allowVideos: s.allowVideos !== undefined ? s.allowVideos : true,
          allowYoutube: s.allowYoutube !== undefined ? s.allowYoutube : true,
          maxImagesPerProduct: s.maxImagesPerProduct || 10,
          maxImageSizeMb: s.maxImageSizeMb || 10,
          maxVideosPerProduct: s.maxVideosPerProduct !== undefined ? s.maxVideosPerProduct : 2,
          maxVideoSizeMb: s.maxVideoSizeMb || 15,
          maxVideoDurationSeconds: s.maxVideoDurationSeconds || 30,
          articleMaxCoverSizeMb: s.articleMaxCoverSizeMb || 10,
          contactEmail: s.contactEmail || '',
          contactPhone: s.contactPhone || '',
          customPlanNote: s.customPlanNote || ''
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load media and platform settings.', { title: 'Network Notice' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/media-settings', formData);
      if (res.data?.success) {
        toast.success('Media upload rate limits and platform controls saved successfully!', { title: 'Settings Saved' });
      } else {
        toast.error(res.data?.error || 'Failed to update settings.', { title: 'Save Failed' });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error saving settings.', { title: 'Network Error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading media settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3 border border-blue-200/60">
            <Sliders size={14} />
            <span>Upload Controls & Rate Limits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Media & Upload Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Control which media formats are permitted on NetZeroMart, enforce maximum file sizes (MB), item counts per product, video clip duration, and manage commercial sales contact details.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer self-start md:self-auto"
          title="Reload settings"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Allowed Media Types (Toggles) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders size={16} className="text-blue-600" />
              <span>Media Format Toggles (What to Allow)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly enable or disable specific media formats across all vendor forms without modifying code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            
            {/* Images Toggle */}
            <div className={`p-5 rounded-2xl border transition-all ${
              formData.allowImages ? 'bg-blue-50/20 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-75'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowImages}
                    onChange={(e) => setFormData({ ...formData, allowImages: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Product Images</h3>
              <p className="text-xs text-slate-500 mt-1">Allow vendors to upload image galleries (JPG, PNG, WEBP).</p>
            </div>

            {/* Direct Videos Toggle */}
            <div className={`p-5 rounded-2xl border transition-all ${
              formData.allowVideos ? 'bg-blue-50/20 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-75'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Video size={20} />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowVideos}
                    onChange={(e) => setFormData({ ...formData, allowVideos: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct Video Uploads</h3>
              <p className="text-xs text-slate-500 mt-1">Allow vendors to upload short MP4/WEBM video clips.</p>
            </div>

            {/* YouTube Embeds Toggle */}
            <div className={`p-5 rounded-2xl border transition-all ${
              formData.allowYoutube ? 'bg-blue-50/20 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-75'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Film size={20} />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowYoutube}
                    onChange={(e) => setFormData({ ...formData, allowYoutube: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
              <h3 className="text-sm font-bold text-slate-900">YouTube Embed Links</h3>
              <p className="text-xs text-slate-500 mt-1">Allow linking unlimited external product demo videos.</p>
            </div>

          </div>
        </div>

        {/* Section 2: Rate Limits & Constraints (How Much to Allow) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert size={16} className="text-indigo-600" />
              <span>Upload Rate Limits & Size Constraints (How Much to Allow)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These restrictions are strictly enforced both on the client before upload and in backend controllers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            
            {/* Max images per product */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Images Per Product
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.maxImagesPerProduct}
                onChange={(e) => setFormData({ ...formData, maxImagesPerProduct: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended: 10 images</p>
            </div>

            {/* Max image size (MB) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Image File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxImageSizeMb}
                onChange={(e) => setFormData({ ...formData, maxImageSizeMb: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended: 10MB per file</p>
            </div>

            {/* Article cover size (MB) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Cover Image Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.articleMaxCoverSizeMb}
                onChange={(e) => setFormData({ ...formData, articleMaxCoverSizeMb: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Articles allow images only</p>
            </div>

            {/* Max videos per product */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Global Max Videos / Product
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.maxVideosPerProduct}
                onChange={(e) => setFormData({ ...formData, maxVideosPerProduct: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended: 2 videos</p>
            </div>

            {/* Max video size (MB) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Video File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.maxVideoSizeMb}
                onChange={(e) => setFormData({ ...formData, maxVideoSizeMb: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended: 15MB for fast loading</p>
            </div>

            {/* Max video duration (seconds) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Video Duration (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={formData.maxVideoDurationSeconds}
                onChange={(e) => setFormData({ ...formData, maxVideoDurationSeconds: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended: 30 seconds</p>
            </div>

          </div>
        </div>

        {/* Section 3: B2B Commercial Sales Desk Contact */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 size={16} className="text-emerald-600" />
              <span>B2B Commercial Contact Information (Custom Enterprise Inquiries)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are surfaced on the vendor subscription manager and onboarding pages for corporate enterprises seeking bespoke packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Commercial Sales Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="sales@netzeromart.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Commercial Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+91 99999 00000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custom B2B Enterprise Notice Copy
              </label>
              <textarea
                rows={2}
                value={formData.customPlanNote}
                onChange={(e) => setFormData({ ...formData, customPlanNote: e.target.value })}
                placeholder="Because NetZeroMart is a specialized B2B trade platform, businesses can request custom enterprise arrangements..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
            <span>Save Media Controls & Limits</span>
          </button>
        </div>

      </form>

    </div>
  );
}
