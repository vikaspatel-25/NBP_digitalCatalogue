import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Plus, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  ArrowLeft, 
  Loader2,
  FileText,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function UpdateProduct({ basePath = '/api/admin' }) {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form fields
  const [form, setForm] = useState({
    productName: '',
    oneLineDescription: '',
    shortDescription: '',
    detailedDescription: '',
    priceMin: '',
    priceMax: '',
    priceNote: '',
    listingPlacement: 'keep'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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

  // Fetch product list
  const loadProducts = () => {
    setLoading(true);
    axios.get(`${basePath}/updateProduct`)
      .then(res => {
        setProducts(res.data.products || []);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        toast.error('Unable to fetch product directory.', { title: 'Network Error' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [basePath]);

  // When a product is selected, prefill all details
  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setForm({
      productName: prod.productName || '',
      oneLineDescription: prod.oneLineDescription || '',
      shortDescription: prod.shortDescription || '',
      detailedDescription: prod.detailedDescription || '',
      priceMin: prod.priceMin || '',
      priceMax: prod.priceMax || '',
      priceNote: prod.priceNote || '',
      listingPlacement: 'keep'
    });
    setFieldErrors({});
    setExistingImages(prod.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setYoutubeLinks(prod.youtubeLinks && prod.youtubeLinks.length ? prod.youtubeLinks : ['']);
    setArticleLinks(prod.articleLinks && prod.articleLinks.length ? prod.articleLinks : ['']);
    setFeedback({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    
    // Check total images limit: max 10
    if (existingImages.length + newImageFiles.length + files.length > 10) {
      toast.warning('Maximum 10 product images allowed. Excess files were ignored.', { title: 'Image Limit' });
      return;
    }

    // Check size limit: max 10MB per file
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`Image "${oversized[0].name}" exceeds 10MB limit. Please compress or choose a smaller file.`, { title: 'File Too Large' });
      return;
    }

    clearFieldError('images');
    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const removeExistingImage = (urlToRemove) => {
    setExistingImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    setFeedback({ type: '', message: '' });

    // Validation checks
    const errors = {};
    if (!form.productName.trim()) {
      errors.productName = 'Product Name is required';
    }
    if (!form.shortDescription.trim()) {
      errors.shortDescription = 'Short Summary is required';
    }
    if (!form.detailedDescription.trim()) {
      errors.detailedDescription = 'Comprehensive Description is required';
    }
    if (form.priceMin && form.priceMax && Number(form.priceMin) > Number(form.priceMax)) {
      errors.priceMax = 'Minimum price cannot exceed maximum price';
    }
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      errors.images = 'At least one product image is required in the catalogue';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      toast.error(errors[firstKey], { title: 'Validation Warning' });
      scrollToElement(`update-${firstKey}`);
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append('productId', selectedProduct._id);
      data.append('productName', form.productName.trim());
      data.append('oneLineDescription', form.oneLineDescription.trim());
      data.append('shortDescription', form.shortDescription.trim());
      data.append('detailedDescription', form.detailedDescription.trim());
      data.append('priceMin', form.priceMin);
      data.append('priceMax', form.priceMax);
      data.append('priceNote', form.priceNote.trim());
      data.append('listingPlacement', form.listingPlacement);

      existingImages.forEach(img => data.append('existingImages', img));
      newImageFiles.forEach(f => data.append('images', f));
      
      youtubeLinks
        .map(normalizeUrl)
        .filter(Boolean)
        .forEach(y => data.append('youtubeLinks', y));

      articleLinks
        .map(normalizeUrl)
        .filter(Boolean)
        .forEach(a => data.append('articleLinks', a));

      const res = await axios.post(`${basePath}/updateProduct`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        const successMsg = `Product "${form.productName}" updated successfully! Changes are live on the storefront.`;
        setFeedback({ 
          type: 'success', 
          message: successMsg 
        });
        toast.success(successMsg, { title: 'Product Updated' });
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errText = res.data?.error || 'Failed to update product.';
        setFeedback({ type: 'error', message: errText });
        toast.error(errText, { title: 'Update Error' });
      }
    } catch (err) {
      console.error('Update product error:', err);
      const errText = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : '') || 'Failed to update product.';
      setFeedback({ 
        type: 'error', 
        message: errText 
      });
      toast.error(errText, { title: 'Update Failed' });
      if (errText.toLowerCase().includes('image')) {
        setFieldErrors(prev => ({ ...prev, images: errText }));
      } else if (errText.toLowerCase().includes('price')) {
        setFieldErrors(prev => ({ ...prev, priceMin: errText }));
      } else if (errText.toLowerCase().includes('name') || errText.toLowerCase().includes('title')) {
        setFieldErrors(prev => ({ ...prev, productName: errText }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Edit3 size={13} />
            <span>Catalogue Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Modify & Update Catalogue Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select an existing published product to adjust specifications, modify price ranges, or swap media.
          </p>
        </div>

        {selectedProduct && (
          <button
            onClick={() => {
              setSelectedProduct(null);
              setFeedback({ type: '', message: '' });
              setFieldErrors({});
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Products List</span>
          </button>
        )}
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium flex-1">{feedback.message}</span>
        </div>
      )}

      {/* Main Content: STEP 1: Search & Selection OR STEP 2: Edit Form */}
      {!selectedProduct ? (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search product by title, keywords, or SKU identifier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs"
            />
          </div>

          {/* Product Cards List */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading published catalog entries...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <Package size={36} className="text-slate-300 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-slate-900">No products match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your query or add a new product.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => (
                <div 
                  key={p._id} 
                  onClick={() => handleSelectProduct(p)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex gap-4 items-center group"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 p-1">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {p.productName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {p.oneLineDescription || p.shortDescription || 'No description available'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">ID: {p._id.slice(-6)}</span>
                      <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                        Select to Edit →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: Edit Form */
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>General Details</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="update-productName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  id="update-productName"
                  type="text"
                  value={form.productName}
                  onChange={(e) => {
                    setForm({ ...form, productName: e.target.value });
                    clearFieldError('productName');
                  }}
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
                  One-Line Description / Summary
                </label>
                <input
                  type="text"
                  value={form.oneLineDescription}
                  onChange={(e) => setForm({ ...form, oneLineDescription: e.target.value })}
                  placeholder="e.g. Next-generation net-zero technology"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Listing Placement
                </label>
                <select
                  value={form.listingPlacement}
                  onChange={(e) => setForm({ ...form, listingPlacement: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                >
                  <option value="keep">Keep Current Position</option>
                  <option value="top">Push to Top (Newest Listing)</option>
                  <option value="bottom">Push to Bottom (Oldest Listing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price Note / Unit
                </label>
                <input
                  type="text"
                  value={form.priceNote}
                  onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                  placeholder="e.g. Per Unit, Per Metric Ton"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label htmlFor="update-priceMin" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Min Price (₹)
                </label>
                <input
                  id="update-priceMin"
                  type="number"
                  value={form.priceMin}
                  onChange={(e) => {
                    setForm({ ...form, priceMin: e.target.value });
                    clearFieldError('priceMin');
                    clearFieldError('priceMax');
                  }}
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
                <label htmlFor="update-priceMax" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Max Price (₹)
                </label>
                <input
                  id="update-priceMax"
                  type="number"
                  value={form.priceMax}
                  onChange={(e) => {
                    setForm({ ...form, priceMax: e.target.value });
                    clearFieldError('priceMax');
                  }}
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
              <span>Detailed Descriptions</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="update-shortDescription" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Summary *
                </label>
                <textarea
                  id="update-shortDescription"
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => {
                    setForm({ ...form, shortDescription: e.target.value });
                    clearFieldError('shortDescription');
                  }}
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
                <label htmlFor="update-detailedDescription" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Comprehensive Technical Description *
                </label>
                <textarea
                  id="update-detailedDescription"
                  rows={6}
                  value={form.detailedDescription}
                  onChange={(e) => {
                    setForm({ ...form, detailedDescription: e.target.value });
                    clearFieldError('detailedDescription');
                  }}
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition leading-relaxed ${
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
          <div id="update-images" className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
              <span>Images & Gallery Management</span>
            </h2>

            {fieldErrors.images && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle size={14} />
                <span>{fieldErrors.images}</span>
              </div>
            )}

            {/* Current Images */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Active Catalog Images ({existingImages.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      title="Remove image"
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Images */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Upload Additional Images (Max 10MB each)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImages}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />

              {newImagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {newImagePreviews.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    YouTube URLs
                  </label>
                  <button
                    type="button"
                    onClick={() => addLink(setYoutubeLinks)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    + Add Link
                  </button>
                </div>
                <div className="space-y-2">
                  {youtubeLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={link}
                        onChange={e => updateLink(setYoutubeLinks, i, e.target.value)}
                        placeholder="e.g. youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                      {youtubeLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(setYoutubeLinks, i)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Article References
                  </label>
                  <button
                    type="button"
                    onClick={() => addLink(setArticleLinks)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    + Add Link
                  </button>
                </div>
                <div className="space-y-2">
                  {articleLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={link}
                        onChange={e => updateLink(setArticleLinks, i, e.target.value)}
                        placeholder="e.g. yoursite.com/specs.pdf"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                      {articleLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(setArticleLinks, i)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setSelectedProduct(null);
                setFieldErrors({});
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving & Updating Cloudinary...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}