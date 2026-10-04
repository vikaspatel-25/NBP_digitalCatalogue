import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  FilePlus, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  Loader2, 
  Link2, 
  Image as ImageIcon,
  Eye,
  Edit3,
  X,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Heading,
  Bold,
  List,
  Quote
} from 'lucide-react';

export default function AddArticle({ basePath = '/api/admin' }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [productLinks, setProductLinks] = useState(['']);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '', articleId: null });

  const textareaRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setPreview('');
  };

  const insertTag = (openTag, closeTag = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = `${openTag}${selected}${closeTag}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 50);
  };

  const handleLinkChange = (index, val) => {
    const copy = [...productLinks];
    copy[index] = val;
    setProductLinks(copy);
  };

  const addLinkField = () => setProductLinks([...productLinks, '']);
  const removeLinkField = (index) => setProductLinks(productLinks.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCoverImage(null);
    setPreview('');
    setProductLinks(['']);
    setFeedback({ type: '', message: '', articleId: null });
    setActiveTab('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'Both article title and body content are required.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '', articleId: null });

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

      const res = await axios.post(`${basePath}/addArticle`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const articleId = res.data?.article?._id || res.data?.articleId;
      setFeedback({ 
        type: 'success', 
        message: 'Article published successfully to the storefront catalogue!',
        articleId 
      });
    } catch (err) {
      console.error('Add article error:', err);
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to publish article.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner - Standardized Minimal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <BookOpen size={13} />
            <span>Editorial Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Publish New Article
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Share thought leadership, case studies, sustainable industry news, and link relevant catalogue products.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 size={13} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye size={13} />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" /> : <AlertCircle size={18} className="flex-shrink-0" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
          {feedback.type === 'success' && (
            <div className="flex items-center gap-2">
              <a
                href="/home"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 underline flex items-center gap-1"
              >
                <span>View on Storefront</span>
                <ExternalLink size={12} />
              </a>
              <button
                onClick={resetForm}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                New Article
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' ? (
        /* LIVE PREVIEW MODE */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100 uppercase tracking-wider">
              Preview Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {title || 'Untitled Article'}
            </h1>
          </div>

          {preview && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-[380px] shadow-xs">
              <img src={preview} alt="Article cover preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div 
            className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{ __html: content ? content.replace(/\n/g, '<br/>') : '<em>No content written yet...</em>' }}
          />

          {productLinks.filter(Boolean).length > 0 && (
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Referenced Product Links</h4>
              <ul className="space-y-1.5 text-xs text-blue-600 list-disc pl-5">
                {productLinks.filter(Boolean).map((link, idx) => (
                  <li key={idx}><span className="underline">{link}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* EDITING MODE */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Article Headline / Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Advancing Industrial Decarbonization with Next-Gen Clean Solutions"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cover Banner Image (Optional)
              </label>
              <span className="text-xs text-slate-400">PNG, JPG, WebP up to 5MB</span>
            </div>

            {preview ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-56 flex items-center justify-center p-2">
                <img src={preview} alt="Cover preview" className="max-h-52 rounded-xl object-contain shadow-xs" />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center transition bg-slate-50/50">
                <input
                  type="file"
                  id="coverUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="coverUpload" className="cursor-pointer flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UploadCloud size={22} />
                  </div>
                  <span className="text-xs font-bold text-blue-600 hover:underline">Select cover banner</span>
                  <span className="text-[11px] text-slate-400">Recommended 1200x630 banner ratio</span>
                </label>
              </div>
            )}
          </div>

          {/* Content Body with Quick Formatting Toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Article Body Content *
              </label>
              <span className="text-xs text-slate-400">
                {content.split(/\s+/).filter(Boolean).length} words | {content.length} chars
              </span>
            </div>

            {/* Formatting Shortcut Chips */}
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-t-xl border-b-0 text-slate-600">
              <button
                type="button"
                onClick={() => insertTag('<h2>', '</h2>')}
                className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                title="Heading"
              >
                <Heading size={13} />
                <span>H2</span>
              </button>
              <button
                type="button"
                onClick={() => insertTag('<strong>', '</strong>')}
                className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertTag('<blockquote>', '</blockquote>')}
                className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                title="Quote"
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
                className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                title="Bullet List"
              >
                <List size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertTag('<p>', '</p>')}
                className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold"
                title="Paragraph"
              >
                &para;
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Write your article paragraphs here. You can use standard formatting or the chips above..."
              className="w-full px-4 py-3 text-sm rounded-b-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Related Product Links */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Referenced Product Links
              </label>
              <button
                type="button"
                onClick={addLinkField}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Add Another Product Link
              </button>
            </div>

            <div className="space-y-2">
              {productLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                      placeholder="https://netzeromart.com/home/product?id=..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  {productLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(idx)}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Preview before publishing</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95"
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
      )}
    </div>
  );
}