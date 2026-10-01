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
  Video,
  FileText,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function UpdateProduct({ basePath = '/api/admin' }) {
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
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [newVideoFiles, setNewVideoFiles] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch product list
  const loadProducts = () => {
    setLoading(true);
    axios.get(`${basePath}/updateProduct`)
      .then(res => {
        setProducts(res.data.products || []);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
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
    setExistingImages(prod.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setExistingVideos(prod.videos || []);
    setNewVideoFiles([]);
    setYoutubeLinks(prod.youtubeLinks && prod.youtubeLinks.length ? prod.youtubeLinks : ['']);
    setArticleLinks(prod.articleLinks && prod.articleLinks.length ? prod.articleLinks : ['']);
    setFeedback({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
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

  const removeExistingVideo = (urlToRemove) => {
    setExistingVideos(prev => prev.filter(url => url !== urlToRemove));
  };

  const removeNewVideo = (index) => {
    setNewVideoFiles(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      setFeedback({ type: 'error', message: 'At least one product image is required in the catalogue.' });
      return;
    }

    if (Number(form.priceMin) > Number(form.priceMax)) {
      setFeedback({ type: 'error', message: 'Minimum price cannot exceed maximum price.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });

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
      existingVideos.forEach(vid => data.append('existingVideos', vid));
      newVideoFiles.forEach(f => data.append('videos', f));
      youtubeLinks.filter(Boolean).forEach(y => data.append('youtubeLinks', y.trim()));
      articleLinks.filter(Boolean).forEach(a => data.append('articleLinks', a.trim()));

      const res = await axios.post(`${basePath}/updateProduct`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setFeedback({ 
          type: 'success', 
          message: `Product "${form.productName}" updated successfully! Changes are live on the storefront.` 
        });
        loadProducts();
      } else {
        setFeedback({ type: 'error', message: res.data?.error || 'Failed to update product.' });
      }
    } catch (err) {
      console.error('Update product error:', err);
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to update product.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Edit3 size={14} />
            <span>Catalogue Editor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Update Existing Product
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search and select any catalogued item to modify specifications, prices, images, and videos.
          </p>
        </div>

        {selectedProduct && (
          <button
            onClick={() => setSelectedProduct(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm self-start sm:self-auto"
          >
            <ArrowLeft size={14} />
            <span>Choose Different Product</span>
          </button>
        )}
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" /> : <AlertCircle size={18} className="flex-shrink-0" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
          {feedback.type === 'success' && selectedProduct && (
            <a
              href={`/home/product?id=${selectedProduct._id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-700 underline flex items-center gap-1"
            >
              <span>View Live</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {!selectedProduct ? (
        /* STEP 1: Search & Selection Grid */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredProducts.length} of {products.length} listed products
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
              <p className="text-sm font-semibold text-slate-600">Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
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
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex gap-4 items-center group"
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>General Details</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={form.priceMin}
                  onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={form.priceMax}
                  onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Descriptions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Descriptions & Specs</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={6}
                  required
                  value={form.detailedDescription}
                  onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Images & Videos Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>Images & Media Assets</span>
            </h2>

            {/* Existing Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Images ({existingImages.length})
                </label>
                <span className="text-xs text-slate-400">Click remove to exclude an image</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={url} alt="" className="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-700"
                      title="Remove image"
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
                Upload Additional Images
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
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos Section */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Video Assets
              </label>
              {existingVideos.length > 0 && (
                <div className="mb-3 space-y-2">
                  {existingVideos.map((url, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Video size={16} className="text-indigo-600" />
                        <span className="truncate">{url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingVideo(url)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                multiple
                accept="video/*"
                onChange={e => setNewVideoFiles(Array.from(e.target.files))}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
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
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Add Link
                  </button>
                </div>
                <div className="space-y-2">
                  {youtubeLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={e => updateLink(setYoutubeLinks, i, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      {youtubeLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(setYoutubeLinks, i)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
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
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Add Link
                  </button>
                </div>
                <div className="space-y-2">
                  {articleLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={e => updateLink(setArticleLinks, i, e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      {articleLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(setArticleLinks, i)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
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
              onClick={() => setSelectedProduct(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
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