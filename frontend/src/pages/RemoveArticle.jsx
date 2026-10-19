import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Loader2, 
  FileText, 
  CheckCircle2,
  CheckSquare, 
  Square, 
  MinusSquare,
  Layers,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function RemoveArticle({ basePath = '/api/admin' }) {
  const { toast } = useToast();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [confirmModal, setConfirmModal] = useState(null); // single deletion
  const [bulkModal, setBulkModal] = useState(false); // bulk deletion

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
    setSelectedIds(new Set());
  }, [basePath]);

  const filtered = articles.filter(a => 
    (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle individual selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select / Deselect All Filtered Items
  const isAllFilteredSelected = filtered.length > 0 && filtered.every(a => selectedIds.has(a._id));
  const isPartiallySelected = filtered.some(a => selectedIds.has(a._id)) && !isAllFilteredSelected;

  const handleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Unselect all currently filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(a => next.delete(a._id));
        return next;
      });
    } else {
      // Select all currently filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(a => next.add(a._id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Single Article Deletion
  const handleOpenSingleModal = (a, e) => {
    if (e) e.stopPropagation();
    setModalError('');
    setConfirmModal(a);
  };

  const handleSingleRemove = async () => {
    if (!confirmModal) return;
    setDeleting(true);
    setModalError('');
    setFeedback({ type: '', message: '' });

    try {
      await axios.post(`${basePath}/removeArticle`, { articleId: confirmModal._id });
      setArticles(prev => prev.filter(a => a._id !== confirmModal._id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(confirmModal._id);
        return next;
      });
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

  // Bulk Articles Deletion
  const handleOpenBulkModal = () => {
    if (selectedIds.size === 0) return;
    setModalError('');
    setBulkModal(true);
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    setModalError('');
    setFeedback({ type: '', message: '' });

    const idsToDelete = Array.from(selectedIds);

    try {
      const res = await axios.post(`${basePath}/removeArticle`, { articleIds: idsToDelete });
      const deletedCount = res.data?.count || idsToDelete.length;

      setArticles(prev => prev.filter(a => !selectedIds.has(a._id)));
      setSelectedIds(new Set());
      setBulkModal(false);

      const msg = `Successfully deleted ${deletedCount} article${deletedCount > 1 ? 's' : ''}.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg, { title: 'Bulk Deletion Complete' });
    } catch (err) {
      console.error('Bulk delete articles error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Failed to remove selected articles.');
      setModalError(errMsg);
      toast.error(errMsg, { title: 'Bulk Deletion Failed' });
    } finally {
      setDeleting(false);
    }
  };

  const selectedArticlesList = articles.filter(a => selectedIds.has(a._id));
  const isMasterAdmin = basePath?.includes('admin');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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
            Select single or multiple articles for bulk deletion. Associated Cloudinary cover assets will be removed automatically.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Layers size={14} className="text-slate-400" />
            <span>Total: <strong>{articles.length}</strong> articles</span>
          </div>
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

      {/* Toolbar: Search & Select All Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter articles by title or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>

        {/* Batch Selection Action Bar */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                isAllFilteredSelected 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : isPartiallySelected
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isAllFilteredSelected ? (
                <CheckSquare size={16} />
              ) : isPartiallySelected ? (
                <MinusSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              <span>
                {isAllFilteredSelected ? 'Deselect All' : `Select All (${filtered.length})`}
              </span>
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              >
                Clear ({selectedIds.size})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar when 1+ selected */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-30 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
              {selectedIds.size}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold">
                {selectedIds.size} article{selectedIds.size > 1 ? 's' : ''} selected
              </div>
              <div className="text-[11px] text-slate-400">
                Ready for permanent deletion
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOpenBulkModal}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Trash2 size={14} />
              <span>Delete {selectedIds.size} Selected</span>
            </button>
          </div>
        </div>
      )}

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
          {filtered.map(a => {
            const isSelected = selectedIds.has(a._id);
            return (
              <div 
                key={a._id} 
                onClick={() => toggleSelect(a._id)}
                className={`p-4 rounded-2xl border shadow-xs transition flex gap-4 items-center justify-between cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-rose-50/40 border-rose-400 ring-2 ring-rose-200/80 shadow-rose-100' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex gap-3.5 items-center min-w-0">
                  {/* Checkbox Trigger */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(a._id);
                    }}
                    className="shrink-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by click
                      className="h-4.5 w-4.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Article Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                    {a.coverImage || a.coverImageUrl ? (
                      <img src={a.coverImage || a.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="text-slate-300" size={24} />
                    )}
                  </div>

                  {/* Article Details */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{a.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Published'} • By {a.companyName || a.userName || 'Admin'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">ID: {a._id.slice(-6)}</p>
                  </div>
                </div>

                {/* Single Remove Button */}
                <button
                  type="button"
                  onClick={(e) => handleOpenSingleModal(a, e)}
                  title="Delete this article"
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition flex-shrink-0 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Article Confirmation Modal */}
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
                onClick={handleSingleRemove}
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

      {/* Bulk Articles Confirmation Modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shrink-0">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Bulk Delete {selectedIds.size} Article{selectedIds.size > 1 ? 's' : ''}
            </h3>
            
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              You are about to permanently delete <strong className="text-slate-800">{selectedIds.size} articles</strong>. All associated cover images will be cleaned up from Cloudinary and removed from the catalogue. This action cannot be undone.
            </p>

            {/* Selected Items List Preview */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 overflow-y-auto max-h-48 mb-4 space-y-2 text-xs divide-y divide-slate-200/60">
              {selectedArticlesList.map((a, idx) => (
                <div key={a._id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="truncate font-semibold text-slate-800">
                    {idx + 1}. {a.title}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    ID: {a._id.slice(-6)}
                  </span>
                </div>
              ))}
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setBulkModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkRemove}
                disabled={deleting}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting {selectedIds.size} Articles...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete ({selectedIds.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}