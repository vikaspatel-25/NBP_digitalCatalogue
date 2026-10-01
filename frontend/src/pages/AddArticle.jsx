import React, { useState } from 'react';
import axios from 'axios';
import { FilePlus, Upload, Check, AlertCircle, Loader2, Link2, Image as ImageIcon } from 'lucide-react';

export default function AddArticle({ basePath = '/api/admin' }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [productLinks, setProductLinks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLinkChange = (index, val) => {
    const copy = [...productLinks];
    copy[index] = val;
    setProductLinks(copy);
  };

  const addLinkField = () => setProductLinks([...productLinks, '']);
  const removeLinkField = (index) => setProductLinks(productLinks.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'Title and content are required.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('content', content.trim());
      if (coverImage) {
        data.append('coverImage', coverImage);
      }
      productLinks.filter(Boolean).forEach(link => {
        data.append('productLinks', link.trim());
      });

      await axios.post(`${basePath}/addArticle`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFeedback({ type: 'success', message: 'Article published successfully!' });
      setTitle('');
      setContent('');
      setCoverImage(null);
      setPreview('');
      setProductLinks(['']);
    } catch (err) {
      console.error('Add article error:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.response?.data || 'Failed to publish article.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Publish Article</h1>
        <p className="text-xs text-slate-500 mt-1">Write and publish educational, net-zero, and product feature articles for the storefront.</p>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <Check size={18} className="text-emerald-600" /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Article Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Advancing Industrial Decarbonization with Net-Zero Technologies"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Cover Banner Image (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center transition bg-slate-50/50">
            <input
              type="file"
              id="coverUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="coverUpload" className="cursor-pointer flex flex-col items-center justify-center">
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="Cover preview" className="w-48 h-28 rounded-lg object-cover border border-slate-200 shadow-sm" />
                  <span className="text-xs text-blue-600 font-semibold hover:underline">Click to change cover image</span>
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-slate-400 mb-1.5" />
                  <span className="text-xs font-semibold text-blue-600 hover:underline">Select cover image</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Article Content *
          </label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your article in plain text or standard HTML tags (<p>, <h2>, <ul>, <strong>, etc.)..."
            className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs leading-relaxed"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">Supports paragraphs, line breaks, and standard HTML formatting.</span>
        </div>

        {/* Related Product Links */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Related Product Links
          </label>
          <div className="space-y-2">
            {productLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    placeholder="https://netzeromart.com/home/product?id=..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                {productLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLinkField(idx)}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLinkField}
              className="text-xs text-blue-600 font-semibold hover:underline inline-block mt-1"
            >
              + Add Another Product Link
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Publishing Article...</span>
              </>
            ) : (
              <span>Publish Article</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}