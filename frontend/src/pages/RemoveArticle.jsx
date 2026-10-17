import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, AlertTriangle, Check, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function RemoveArticle({ basePath = '/api/admin' }) {
  const { toast } = useToast();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [modalError, setModalError] = useState('');

  const loadArticles = () => {
    setLoading(true);
    axios.get(`${basePath}/removeArticle`)
      .then(res => setArticles(res.data.articles || []))
      .catch(err => {
        console.error('Failed to load articles:', err);
        const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to load article catalogue.';
        toast.error(msg, { title: 'Network Notice' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, [basePath]);

  const handleOpenModal = (a) => {
    setModalError('');
    setConfirmModal(a);
  };

  const handleRemove = async () => {
    if (!confirmModal) return;
    setDeleting(true);
    setModalError('');
    setFeedback({ type: '', message: '' });

    try {
      await axios.post(`${basePath}/removeArticle`, { articleId: confirmModal._id });
      setArticles(prev => prev.filter(a => a._id !== confirmModal._id));
      const msg = `Article "${confirmModal.title}" was permanently removed.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg, { title: 'Article Deleted' });
      setConfirmModal(null);
    } catch (err) {
      console.error('Delete article error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Failed to remove article.');
      setModalError(errMsg);
      setFeedback({ type: 'error', message: errMsg });
      toast.error(errMsg, { title: 'Deletion Failed' });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = articles.filter(a => 
    (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMasterAdmin = basePath?.includes('admin');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Trash2 size={13} />
            <span>{isMasterAdmin ? 'Content Moderation' : 'Article Management'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isMasterAdmin ? 'Remove Articles' : 'Manage Articles'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select and delete published articles from the catalogue. Associated Cloudinary cover assets will be removed.
          </p>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" /> : <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Filter articles by title or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-rose-600" size={20} />
          <span>Loading articles...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          No articles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(a => (
            <div key={a._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-200 transition flex gap-4 items-center justify-between">
              <div className="flex gap-3.5 items-center min-w-0">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                  {a.coverImage ? (
                    <img src={a.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="text-slate-300" size={24} />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{a.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Published'} • By {a.companyName || a.userName || 'Admin'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">ID: {a._id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenModal(a)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition flex-shrink-0 cursor-pointer"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Article Deletion</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to delete <strong>"{confirmModal.title}"</strong>? This will remove the article from the storefront and delete the cover image from Cloudinary.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{deleting ? 'Deleting...' : 'Delete Article'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}