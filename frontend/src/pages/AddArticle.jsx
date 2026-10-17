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
import { useToast } from '../context/ToastContext';

export default function AddArticle({ basePath = '/api/admin' }) {
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [productLinks, setProductLinks] = useState(['']);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '', articleId: null });
  const [fieldErrors, setFieldErrors] = useState({});

  const textareaRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover image exceeds 5MB limit. Please choose a smaller file.', { title: 'File Too Large' });
        return;
      }
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
      toast.info('Cover image selected.', { title: 'Image Ready' });
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
    clearFieldError('content');

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

  const normalizeUrl = (url) => {
    const trimmed = String(url || '').trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCoverImage(null);
    setPreview('');
    setProductLinks(['']);
    setFeedback({ type: '', message: '', articleId: null });
    setFieldErrors({});
    setActiveTab('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '', articleId: null });

    const errors = {};
    if (!title.trim()) {
      errors.title = 'Article headline / title is required';
    }
    if (!content.trim()) {
      errors.content = 'Article body content cannot be empty';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      toast.error(errors[firstKey], { title: 'Required Fields Missing' });
      scrollToElement(`article-${firstKey}`);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('content', content.trim());
      if (coverImage) {
        data.append('coverImage', coverImage);
      }
      productLinks
        .map(normalizeUrl)
        .filter(Boolean)
        .forEach(link => {
          data.append('productLinks', link);
        });

      const res = await axios.post(`${basePath}/addArticle`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const articleId = res.data?.article?._id || res.data?.articleId;
      const successMsg = 'Article published successfully to the storefront catalogue!';
      setFeedback({ 
        type: 'success', 
        message: successMsg,
        articleId 
      });
      toast.success(successMsg, { title: 'Article Published' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Add article error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : '') || err.message || 'Failed to publish article.';
      setFeedback({ 
        type: 'error', 
        message: errorMsg 
      });
      toast.error(errorMsg, { title: 'Publishing Error' });
      if (errorMsg.toLowerCase().includes('title')) {
        setFieldErrors(prev => ({ ...prev, title: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('content')) {
        setFieldErrors(prev => ({ ...prev, content: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('video') || errorMsg.toLowerCase().includes('image')) {
        setFieldErrors(prev => ({ ...prev, coverImage: errorMsg }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 size={14} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye size={14} />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>

          {feedback.type === 'success' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-100/50 transition cursor-pointer"
              >
                Write Another
              </button>
              {feedback.articleId && (
                <a
                  href={`/home/article?id=${feedback.articleId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <span>View Live</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode View Switch */}
      {activeTab === 'preview' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto space-y-6">
          {preview ? (
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={preview} alt="Article Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-32 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
              No Cover Image Selected (Optional)
            </div>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || 'Untitled Article Headline'}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Published on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Preview Mode
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {content || 'Article content body will render here...'}
          </div>

          {productLinks.filter(Boolean).length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Featured Product References
              </h4>
              <ul className="space-y-1">
                {productLinks.filter(Boolean).map((link, i) => (
                  <li key={i}>
                    <a href={normalizeUrl(link)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink size={12} /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <label htmlFor="article-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Title / Headline *
              </label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError('title');
                }}
                placeholder="e.g. Breakthroughs in Commercial Solar Storage & Energy Independence"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition ${
                  fieldErrors.title 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.title && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Quick Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Quick Tags:</span>
              <button
                type="button"
                onClick={() => insertTag('<h2>', '</h2>')}
                className="px-2.5 py-1 hover:bg-white rounded-lg font-bold border border-transparent hover:border-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <Heading size={12} /> H2
              </button>
              <button
                type="button"
                onClick={() => insertTag('<h3>', '</h3>')}
                className="px-2.5 py-1 hover:bg-white rounded-lg font-bold border border-transparent hover:border-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <Heading size={12} /> H3
              </button>
              <button
                type="button"
                onClick={() => insertTag('<b>', '</b>')}
                className="px-2.5 py-1 hover:bg-white rounded-lg font-bold border border-transparent hover:border-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <Bold size={12} /> Bold
              </button>
              <button
                type="button"
                onClick={() => insertTag('<blockquote>', '</blockquote>')}
                className="px-2.5 py-1 hover:bg-white rounded-lg font-bold border border-transparent hover:border-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <Quote size={12} /> Quote
              </button>
              <button
                type="button"
                onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
                className="px-2.5 py-1 hover:bg-white rounded-lg font-bold border border-transparent hover:border-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <List size={12} /> List
              </button>
            </div>

            <div>
              <label htmlFor="article-content" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Body Content (Markdown / HTML Supported) *
              </label>
              <textarea
                id="article-content"
                ref={textareaRef}
                rows={12}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  clearFieldError('content');
                }}
                placeholder="Compose your article content here. You can use standard formatting, headings, bullet lists, or simple HTML tags..."
                className={`w-full p-4 bg-slate-50 border rounded-xl text-sm focus:outline-none transition leading-relaxed font-sans ${
                  fieldErrors.content 
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {fieldErrors.content && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.content}
                </p>
              )}
            </div>
          </div>

          {/* Media & Cover Image Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
              <span>Article Cover Image (Optional)</span>
            </h2>

            {preview ? (
              <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-slate-200">
                <img src={preview} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-6 text-center bg-slate-50/50">
                <input
                  type="file"
                  id="coverImageInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="coverImageInput" className="cursor-pointer flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-xs font-bold text-blue-600 hover:underline">Upload cover image</span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB (No direct videos allowed)</span>
                </label>
              </div>
            )}
          </div>

          {/* Connected Products Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Featured Product Links</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Attach links to catalogue items related to this article topic.</p>
              </div>
              <button
                type="button"
                onClick={addLinkField}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                + Add Product Link
              </button>
            </div>

            <div className="space-y-2">
              {productLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                      placeholder="e.g. netzeromart.com/home/product?id=..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  {productLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(idx)}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
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
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>Preview before publishing</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95 cursor-pointer"
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