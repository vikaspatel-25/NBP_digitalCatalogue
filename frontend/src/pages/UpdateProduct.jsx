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
  FileText
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

  // When a product is selected, fetch or load full details
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
    setYoutubeLinks(prod.youtubeLinks || []);
    setArticleLinks(prod.articleLinks || []);
    setFeedback({ type: '', message: '' });
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      setFeedback({ type: 'error', message: 'At least one product image is required.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('productId', selectedProduct._id);
      data.append('productName', form.productName);
      data.append('oneLineDescription', form.oneLineDescription);
      data.append('shortDescription', form.shortDescription);
      data.append('detailedDescription', form.detailedDescription);
      data.append('priceMin', form.priceMin);
      data.append('priceMax', form.priceMax);
      data.append('priceNote', form.priceNote);
      data.append('listingPlacement', form.listingPlacement);

      existingImages.forEach(img => data.append('existingImages', img));
      newImageFiles.forEach(f => data.append('images', f));
      existingVideos.forEach(vid => data.append('existingVideos', vid));
      newVideoFiles.forEach(f => data.append('videos', f));
      youtubeLinks.filter(Boolean).forEach(y => data.append('youtubeLinks', y));
      articleLinks.filter(Boolean).forEach(a => data.append('articleLinks', a));

      const res = await axios.post(`${basePath}/updateProduct`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFeedback({ type: 'success', message: 'Product updated successfully in the catalogue!' });
      loadProducts();
    } catch (err) {
      console.error('Update product error:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.response?.data || 'Failed to update product.' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p => 
    (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Update Product</h1>
          <p className="text-xs text-slate-500 mt-1">Search, select, and refine details of existing products in the catalogue.</p>
        </div>
        {selectedProduct && (
          <button 
            onClick={() => setSelectedProduct(null)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={14} /> Back to Search List
          </button>
        )}
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <Check size={18} className="text-emerald-600" /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {!selectedProduct ? (
        /* Product Selection Screen */
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search product by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading catalogue products...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              No products found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <div 
                  key={p._id}
                  onClick={() => handleSelectProduct(p)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex gap-3.5 items-center group"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition">{p.productName}</h3>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">₹{p.priceMin} - ₹{p.priceMax}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-1">ID: {p._id}</p>
                  </div>
                  <Edit3 size={16} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-xl text-xs text-blue-900 border border-blue-100">
            <span>Editing: <strong>{selectedProduct.productName}</strong> (ID: {selectedProduct._id})</span>
            <a href={`/home/product?id=${selectedProduct._id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline">
              View Live <ExternalLink size={12} />
            </a>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input 
                type="text"
                value={form.productName}
                onChange={e => setForm({...form, productName: e.target.value})}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / One-Line Summary</label>
              <input 
                type="text"
                value={form.oneLineDescription}
                onChange={e => setForm({...form, oneLineDescription: e.target.value})}
                placeholder="High-efficiency eco solar cells"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Price (₹) *</label>
                <input 
                  type="number"
                  value={form.priceMin}
                  onChange={e => setForm({...form, priceMin: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Price (₹) *</label>
                <input 
                  type="number"
                  value={form.priceMax}
                  onChange={e => setForm({...form, priceMax: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price Note</label>
                <input 
                  type="text"
                  value={form.priceNote}
                  onChange={e => setForm({...form, priceNote: e.target.value})}
                  placeholder="e.g. Per unit / Per ton"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catalogue Placement</label>
              <select 
                value={form.listingPlacement}
                onChange={e => setForm({...form, listingPlacement: e.target.value})}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="keep">Keep Current Placement (Order: {selectedProduct.order || 0})</option>
                <option value="top">Push to Top of Catalogue</option>
                <option value="bottom">Push to Bottom of Catalogue</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Descriptions</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description (Cards) *</label>
              <textarea 
                rows={2}
                value={form.shortDescription}
                onChange={e => setForm({...form, shortDescription: e.target.value})}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea 
                rows={4}
                value={form.detailedDescription}
                onChange={e => setForm({...form, detailedDescription: e.target.value})}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Images Gallery Management */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Product Images ({existingImages.length + newImageFiles.length})</h3>
              <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Plus size={14} /> Add Images
                <input type="file" multiple accept="image/*" onChange={handleNewImages} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-50">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 transition shadow"
                    title="Remove Image"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded">Saved</span>
                </div>
              ))}
              {newImagePreviews.map((preview, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border-2 border-dashed border-emerald-400 bg-emerald-50/30">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 transition shadow"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-emerald-700 text-[9px] text-white px-1.5 py-0.5 rounded">New</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Management */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Videos & Links</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Video URLs</label>
              <div className="space-y-2">
                {youtubeLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="url"
                      value={link}
                      onChange={e => {
                        const copy = [...youtubeLinks];
                        copy[i] = e.target.value;
                        setYoutubeLinks(copy);
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                    />
                    <button type="button" onClick={() => setYoutubeLinks(youtubeLinks.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setYoutubeLinks([...youtubeLinks, ''])} className="text-xs text-blue-600 font-semibold hover:underline">
                  + Add YouTube Link
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Related Article URLs</label>
              <div className="space-y-2">
                {articleLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="url"
                      value={link}
                      onChange={e => {
                        const copy = [...articleLinks];
                        copy[i] = e.target.value;
                        setArticleLinks(copy);
                      }}
                      placeholder="https://example.com/article..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                    />
                    <button type="button" onClick={() => setArticleLinks(articleLinks.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setArticleLinks([...articleLinks, ''])} className="text-xs text-blue-600 font-semibold hover:underline">
                  + Add Article Link
                </button>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save All Changes</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}