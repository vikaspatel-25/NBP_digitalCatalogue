import React, { useState } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  X, 
  Loader2, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Image as ImageIcon, 
  Link2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

export default function AddProduct({ apiEndpoint = '/api/admin/addProduct', role = 'admin' }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [productName, setProductName] = useState('');
  const [oneLineDescription, setOneLineDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceNote, setPriceNote] = useState('');
  const [listingPlacement, setListingPlacement] = useState('top');

  // Media states
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [articleLinks, setArticleLinks] = useState(['']);

  // Drag states
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const handleImageFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (images.length + validFiles.length > 10) {
      alert('Maximum 10 product images allowed.');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, { name: file.name, url: e.target.result, size: (file.size / 1024).toFixed(0) }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = (setter) => setter(prev => [...prev, '']);
  const updateLink = (setter, index, value) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };
  const removeLink = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setProductName('');
    setOneLineDescription('');
    setShortDescription('');
    setDetailedDescription('');
    setPriceMin('');
    setPriceMax('');
    setPriceNote('');
    setListingPlacement('top');
    setImages([]);
    setImagePreviews([]);
    setYoutubeLinks(['']);
    setArticleLinks(['']);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    if (Number(priceMin) > Number(priceMax)) {
      setError('Minimum price cannot be greater than maximum price.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('productName', productName.trim());
    formData.append('oneLineDescription', oneLineDescription.trim());
    formData.append('shortDescription', shortDescription.trim());
    formData.append('detailedDescription', detailedDescription.trim());
    formData.append('priceMin', priceMin.trim());
    formData.append('priceMax', priceMax.trim());
    formData.append('priceNote', priceNote.trim());
    formData.append('listingPlacement', listingPlacement);

    images.forEach(img => formData.append('images', img));

    youtubeLinks.filter(Boolean).forEach(link => formData.append('youtubeLinks[]', link.trim()));
    articleLinks.filter(Boolean).forEach(link => formData.append('articleLinks[]', link.trim()));

    try {
      const res = await axios.post(apiEndpoint, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.data?.error || 'Failed to save product.');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload media and save product.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={42} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Product Listed Successfully!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              <strong>{productName}</strong> is now catalogued and visible to prospective customers on NetZeroMart.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/home"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>View Live Storefront</span>
              <ArrowRight size={14} />
            </a>
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm shadow-blue-600/20"
            >
              Add Another Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner - Standardized Minimal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            {role === 'admin' ? <ShieldCheck size={13} /> : <Building2 size={13} />}
            <span>{role === 'admin' ? 'Master Admin Listing' : 'Vendor Catalogue Listing'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Add New Product
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish high-impact sustainable products, equipment specifications, pricing estimates, and brochures.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>General Specifications</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g. High-Efficiency Monocrystalline Solar Panel 550W"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                One-Line Tagline / Punchline
              </label>
              <input
                type="text"
                value={oneLineDescription}
                onChange={e => setOneLineDescription(e.target.value)}
                placeholder="e.g. Next-generation photovoltaic efficiency certified for industrial rooftop installations"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catalog Priority / Placement
              </label>
              <select
                value={listingPlacement}
                onChange={e => setListingPlacement(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="top">Push to Top (Featured / Newest)</option>
                <option value="bottom">Standard Placement (Bottom)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit / Price Note
              </label>
              <input
                type="text"
                value={priceNote}
                onChange={e => setPriceNote(e.target.value)}
                placeholder="e.g. Per unit, Per kW, Ex-Factory"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Minimum Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="10000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Maximum Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
              />
            </div>
          </div>
        </div>

        {/* Descriptions Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Descriptions & Technical Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Summary (Card View) *
              </label>
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Concise 1-2 sentence overview for catalog search cards..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Comprehensive Technical Description *
              </label>
              <textarea
                required
                rows={6}
                value={detailedDescription}
                onChange={e => setDetailedDescription(e.target.value)}
                placeholder="Full technical specifications, efficiency ratings, compliance certifications, durability metrics, warranty, and installation details..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Media & Gallery Upload Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>Product Imagery & Media</span>
          </h2>

          {/* Drag & Drop Image Zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Images * ({images.length}/10 selected)
              </label>
              <span className="text-xs text-slate-400">PNG, JPG, WebP up to 10MB</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={(e) => { e.preventDefault(); setIsDraggingImage(false); handleImageFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                isDraggingImage
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="productImagesUpload"
                multiple
                accept="image/*"
                onChange={e => handleImageFiles(e.target.files)}
                className="hidden"
              />
              <label htmlFor="productImagesUpload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <span className="text-sm font-bold text-blue-600 hover:underline">Click to browse images</span>
                  <span className="text-sm text-slate-500"> or drag and drop files here</span>
                </div>
                <p className="text-xs text-slate-400">First image will serve as primary catalog cover</p>
              </label>
            </div>

            {/* Thumbnail Gallery Preview */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>



          {/* External Links Section */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  YouTube Demonstrations
                </label>
                <button
                  type="button"
                  onClick={() => addLink(setYoutubeLinks)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2">
                {youtubeLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={e => updateLink(setYoutubeLinks, idx, e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    {youtubeLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(setYoutubeLinks, idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Technical Articles & Specs
                </label>
                <button
                  type="button"
                  onClick={() => addLink(setArticleLinks)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2">
                {articleLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={e => updateLink(setArticleLinks, idx, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    {articleLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(setArticleLinks, idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs text-slate-500">
            {images.length === 0 ? (
              <span className="text-amber-600 font-medium">⚠️ At least 1 image is required to submit</span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ Ready to publish to digital catalogue</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading Media & Listing Product...</span>
              </>
            ) : (
              <span>Publish Product to Catalogue</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
