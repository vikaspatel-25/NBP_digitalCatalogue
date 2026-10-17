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
import { useToast } from '../context/ToastContext';

export default function AddProduct({ apiEndpoint = '/api/admin/addProduct', role = 'admin' }) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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
  const [mediaSettings, setMediaSettings] = useState({
    allowImages: true,
    allowVideos: true,
    allowYoutube: true,
    maxImagesPerProduct: 10,
    maxImageSizeMb: 10,
    maxVideosPerProduct: 2,
    maxVideoSizeMb: 15
  });

  useEffect(() => {
    axios.get('/api/platform/media-settings')
      .then(res => {
        if (res.data?.settings) {
          setMediaSettings(prev => ({ ...prev, ...res.data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  // Drag states
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const clearFieldError = (fieldName) => {
    setFieldErrors(prev => {
      if (!prev[fieldName]) return prev;
      const copy = { ...prev };
      delete copy[fieldName];
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

  const handleImageFiles = (files) => {
    if (mediaSettings.allowImages === false) {
      toast.error('Product image uploads are currently disabled by the platform administrator.', { title: 'Uploads Disabled' });
      return;
    }

    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const maxImgCount = mediaSettings.maxImagesPerProduct || 10;
    
    if (images.length + validFiles.length > maxImgCount) {
      toast.warning(`Maximum ${maxImgCount} product images allowed. Excess files were ignored.`, { title: 'Image Limit' });
      return;
    }

    // Check size limit: max configured MB per file
    const maxBytes = (mediaSettings.maxImageSizeMb || 10) * 1024 * 1024;
    const oversized = validFiles.filter(f => f.size > maxBytes);
    if (oversized.length > 0) {
      toast.error(`Image "${oversized[0].name}" exceeds the ${mediaSettings.maxImageSizeMb || 10}MB size limit set by administrator.`, { title: 'File Too Large' });
      return;
    }

    clearFieldError('images');
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
    setFieldErrors({});
    setSuccess(false);
  };

  const normalizeUrl = (url) => {
    const trimmed = String(url || '').trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Active validation check
    const errors = {};
    if (!productName.trim()) {
      errors.productName = 'Product Title / Name is required';
    }
    if (!shortDescription.trim()) {
      errors.shortDescription = 'Short summary description is required';
    }
    if (!detailedDescription.trim()) {
      errors.detailedDescription = 'Comprehensive technical description is required';
    }
    if (!priceMin.toString().trim() || Number(priceMin) < 0) {
      errors.priceMin = 'Estimated minimum price is required';
    }
    if (!priceMax.toString().trim() || Number(priceMax) < 0) {
      errors.priceMax = 'Estimated maximum price is required';
    }
    if (priceMin && priceMax && Number(priceMin) > Number(priceMax)) {
      errors.priceMax = 'Maximum price cannot be less than minimum price';
    }
    if (images.length === 0) {
      errors.images = 'Please upload at least 1 product image';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      toast.error(errors[firstKey], { title: 'Required Fields Incomplete' });
      scrollToElement(`field-${firstKey}`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('productName', productName.trim());
    formData.append('oneLineDescription', oneLineDescription.trim());
    formData.append('shortDescription', shortDescription.trim());
    formData.append('detailedDescription', detailedDescription.trim());
    formData.append('priceMin', priceMin.toString().trim());
    formData.append('priceMax', priceMax.toString().trim());
    formData.append('priceNote', priceNote.trim());
    formData.append('listingPlacement', listingPlacement);

    images.forEach(img => formData.append('images', img));

    youtubeLinks
      .map(normalizeUrl)
      .filter(Boolean)
      .forEach(link => formData.append('youtubeLinks[]', link));

    articleLinks
      .map(normalizeUrl)
      .filter(Boolean)
      .forEach(link => formData.append('articleLinks[]', link));

    try {
      const res = await axios.post(apiEndpoint, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        toast.success('Product successfully published to the digital catalogue!', { title: 'Product Published' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errorMsg = res.data?.error || 'Failed to save product.';
        setError(errorMsg);
        toast.error(errorMsg, { title: 'Publishing Error' });
      }
    } catch (err) {
      console.error('Error adding product:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' && !err.response.data.includes('<') ? err.response.data : '') || err.message || 'Failed to upload media and save product.';
      setError(errorMsg);
      toast.error(errorMsg, { title: 'Failed to Save Product' });
      if (errorMsg.toLowerCase().includes('image')) {
        setFieldErrors(prev => ({ ...prev, images: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('price')) {
        setFieldErrors(prev => ({ ...prev, priceMin: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('name') || errorMsg.toLowerCase().includes('title')) {
        setFieldErrors(prev => ({ ...prev, productName: errorMsg }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-lg shadow-blue-500/5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Published Successfully!</h2>
          <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto">
            Your product has been catalogued with technical specifications, image gallery, and links.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
            >
              Add Another Product
            </button>
            <a
              href="/product"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition text-center"
            >
              View Public Catalog
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Building2 size={13} />
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
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>General Specifications</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="field-productName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Title / Name *
              </label>
              <input
                id="field-productName"
                type="text"
                value={productName}
                onChange={e => {
                  setProductName(e.target.value);
                  clearFieldError('productName');
                }}
                placeholder="e.g. High-Efficiency Monocrystalline Solar Panel 550W"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition ${
                  fieldErrors.productName 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.productName && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.productName}
                </p>
              )}
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
              <label htmlFor="field-priceMin" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Minimum Price (₹) *
              </label>
              <input
                id="field-priceMin"
                type="number"
                min="0"
                value={priceMin}
                onChange={e => {
                  setPriceMin(e.target.value);
                  clearFieldError('priceMin');
                  clearFieldError('priceMax');
                }}
                placeholder="10000"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition font-mono ${
                  fieldErrors.priceMin 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.priceMin && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.priceMin}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="field-priceMax" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Maximum Price (₹) *
              </label>
              <input
                id="field-priceMax"
                type="number"
                min="0"
                value={priceMax}
                onChange={e => {
                  setPriceMax(e.target.value);
                  clearFieldError('priceMax');
                }}
                placeholder="15000"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition font-mono ${
                  fieldErrors.priceMax 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.priceMax && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.priceMax}
                </p>
              )}
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
              <label htmlFor="field-shortDescription" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Summary (Card View) *
              </label>
              <textarea
                id="field-shortDescription"
                rows={2}
                value={shortDescription}
                onChange={e => {
                  setShortDescription(e.target.value);
                  clearFieldError('shortDescription');
                }}
                placeholder="Concise 1-2 sentence overview for catalog search cards..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition leading-relaxed ${
                  fieldErrors.shortDescription 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.shortDescription && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.shortDescription}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="field-detailedDescription" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Comprehensive Technical Description *
              </label>
              <textarea
                id="field-detailedDescription"
                rows={5}
                value={detailedDescription}
                onChange={e => {
                  setDetailedDescription(e.target.value);
                  clearFieldError('detailedDescription');
                }}
                placeholder="Detailed technical specifications, materials, warranty, standards, and deployment guidance..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition leading-relaxed font-sans ${
                  fieldErrors.detailedDescription 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.detailedDescription && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.detailedDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Media & Attachments Card */}
        <div id="field-images" className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
              <span>Images & Media Assets</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {images.length}/10 Images
            </span>
          </div>

          <div>
            <div
              onDragOver={e => { e.preventDefault(); setIsDraggingImage(true); }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDraggingImage(false);
                handleImageFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-colors ${
                fieldErrors.images 
                  ? 'border-rose-400 bg-rose-50/30' 
                  : isDraggingImage 
                    ? 'border-blue-500 bg-blue-50/50' 
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                  fieldErrors.images ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <UploadCloud size={24} />
                </div>
                <div>
                  <span className="text-sm font-bold text-blue-600 hover:underline">Click to browse images</span>
                  <span className="text-sm text-slate-500"> or drag and drop files here</span>
                </div>
                <p className="text-xs text-slate-400">First image will serve as primary catalog cover (Max 10MB each)</p>
              </label>
            </div>

            {fieldErrors.images && (
              <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
                <AlertCircle size={13} /> {fieldErrors.images}
              </p>
            )}

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
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2">
                {youtubeLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link}
                      onChange={e => updateLink(setYoutubeLinks, idx, e.target.value)}
                      placeholder="e.g. youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    {youtubeLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(setYoutubeLinks, idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
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
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2">
                {articleLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link}
                      onChange={e => updateLink(setArticleLinks, idx, e.target.value)}
                      placeholder="e.g. yoursite.com/specs.pdf"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    {articleLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(setArticleLinks, idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
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
              <span className="text-amber-600 font-medium">⚠️ At least 1 image is required to publish</span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ Ready to publish to digital catalogue</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
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
