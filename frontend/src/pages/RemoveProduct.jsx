import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  MinusSquare,
  Layers,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function RemoveProduct({ basePath = '/api/admin' }) {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Modals
  const [confirmModal, setConfirmModal] = useState(null); // single product deletion
  const [bulkModal, setBulkModal] = useState(false); // bulk products deletion
  
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [modalError, setModalError] = useState('');

  const loadProducts = () => {
    setLoading(true);
    axios.get(`${basePath}/removeProduct`)
      .then(res => setProducts(res.data.products || []))
      .catch(err => {
        // Fallback: try updateProduct endpoint to fetch list
        axios.get(`${basePath}/updateProduct`)
          .then(r => setProducts(r.data.products || []))
          .catch(fallbackErr => {
            console.error('Failed to load products:', fallbackErr);
            const msg = fallbackErr.response?.data?.error || fallbackErr.response?.data?.message || 'Failed to load product catalogue.';
            toast.error(msg, { title: 'Network Notice' });
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    setSelectedIds(new Set());
  }, [basePath]);

  const filtered = products.filter(p => 
    (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p._id || '').toLowerCase().includes(searchTerm.toLowerCase())
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
  const isAllFilteredSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p._id));
  const isPartiallySelected = filtered.some(p => selectedIds.has(p._id)) && !isAllFilteredSelected;

  const handleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Unselect all currently filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(p => next.delete(p._id));
        return next;
      });
    } else {
      // Select all currently filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(p => next.add(p._id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Single Item Deletion
  const handleOpenSingleModal = (p, e) => {
    if (e) e.stopPropagation();
    setModalError('');
    setConfirmModal(p);
  };

  const handleSingleRemove = async () => {
    if (!confirmModal) return;
    setDeleting(true);
    setModalError('');
    setFeedback({ type: '', message: '' });

    try {
      await axios.post(`${basePath}/removeProduct`, { productId: confirmModal._id });
      setProducts(prev => prev.filter(p => p._id !== confirmModal._id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(confirmModal._id);
        return next;
      });
      const msg = `Product "${confirmModal.productName}" was removed from the catalogue.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg, { title: 'Product Removed' });
      setConfirmModal(null);
    } catch (err) {
      console.error('Delete product error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Failed to remove product.');
      setModalError(errMsg);
      setFeedback({ type: 'error', message: errMsg });
      toast.error(errMsg, { title: 'Deletion Failed' });
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Deletion
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
      const res = await axios.post(`${basePath}/removeProduct`, { productIds: idsToDelete });
      const deletedCount = res.data?.count || idsToDelete.length;
      
      setProducts(prev => prev.filter(p => !selectedIds.has(p._id)));
      setSelectedIds(new Set());
      setBulkModal(false);

      const msg = `Successfully deleted ${deletedCount} product${deletedCount > 1 ? 's' : ''} from the catalogue.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg, { title: 'Bulk Deletion Complete' });
    } catch (err) {
      console.error('Bulk delete error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' && !err.response?.data.includes('<') ? err.response.data : 'Failed to remove selected products.');
      setModalError(errMsg);
      toast.error(errMsg, { title: 'Bulk Deletion Failed' });
    } finally {
      setDeleting(false);
    }
  };

  const selectedProductsList = products.filter(p => selectedIds.has(p._id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Trash2 size={13} />
            <span>Catalogue Deletion</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Remove Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select single or multiple products for bulk deletion. Associated Cloudinary media will be cleaned up automatically.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Layers size={14} className="text-slate-400" />
            <span>Total: <strong>{products.length}</strong> items</span>
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
            placeholder="Filter products to remove..." 
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
                {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
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
          <span>Loading products...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const isSelected = selectedIds.has(p._id);
            return (
              <div 
                key={p._id} 
                onClick={() => toggleSelect(p._id)}
                className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3 transition cursor-pointer relative select-none ${
                  isSelected 
                    ? 'bg-rose-50/40 border-rose-400 ring-2 ring-rose-200/80 shadow-rose-100' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Checkbox Trigger */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(p._id);
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

                {/* Product Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 p-1">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-slate-300" size={20} />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{p.productName}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{p.oneLineDescription || 'No description'}</p>
                  <span className="font-mono text-[10px] text-slate-400 mt-1 block">ID: {p._id.slice(-6)}</span>
                </div>

                {/* Single Remove Button */}
                <button
                  type="button"
                  onClick={(e) => handleOpenSingleModal(p, e)}
                  title="Delete this product"
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition flex-shrink-0 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Product Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Product Removal</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{confirmModal.productName}"</strong>? This will remove the listing and delete its images from Cloudinary. This action cannot be undone.
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
                <span>{deleting ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Products Confirmation Modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shrink-0">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Bulk Delete {selectedIds.size} Product{selectedIds.size > 1 ? 's' : ''}
            </h3>
            
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              You are about to permanently delete <strong className="text-slate-800">{selectedIds.size} products</strong> from your catalogue. All associated photos, videos, and specifications will be wiped from Cloudinary and our database. This action is irreversible.
            </p>

            {/* Selected Items List Preview */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 overflow-y-auto max-h-48 mb-4 space-y-2 text-xs divide-y divide-slate-200/60">
              {selectedProductsList.map((p, idx) => (
                <div key={p._id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="truncate font-semibold text-slate-800">
                    {idx + 1}. {p.productName}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    ID: {p._id.slice(-6)}
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
                    <span>Deleting {selectedIds.size} Products...</span>
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