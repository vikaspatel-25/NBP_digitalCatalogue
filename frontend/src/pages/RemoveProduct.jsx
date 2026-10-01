import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, AlertTriangle, Check, Loader2, Image as ImageIcon } from 'lucide-react';

export default function RemoveProduct({ basePath = '/api/admin' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // holds product to remove
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadProducts = () => {
    setLoading(true);
    axios.get(`${basePath}/removeProduct`)
      .then(res => setProducts(res.data.products || []))
      .catch(err => {
        // Fallback: try updateProduct endpoint to fetch list
        axios.get(`${basePath}/updateProduct`)
          .then(r => setProducts(r.data.products || []))
          .catch(console.error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [basePath]);

  const handleRemove = async () => {
    if (!confirmModal) return;
    setDeleting(true);
    setFeedback({ type: '', message: '' });

    try {
      await axios.post(`${basePath}/removeProduct`, { productId: confirmModal._id });
      setProducts(prev => prev.filter(p => p._id !== confirmModal._id));
      setFeedback({ type: 'success', message: `Product "${confirmModal.productName}" was removed from the catalogue.` });
      setConfirmModal(null);
    } catch (err) {
      console.error('Delete product error:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.response?.data || 'Failed to remove product.' });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter(p => 
    (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Remove Product</h1>
        <p className="text-xs text-slate-500 mt-1">Select and delete products from the catalogue. Associated Cloudinary media will be cleaned up.</p>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <Check size={18} className="text-emerald-600" /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Filter products to remove..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading products...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition flex gap-3.5 items-center justify-between">
              <div className="flex gap-3 items-center min-w-0">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-slate-300" size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{p.productName}</h4>
                  <p className="text-xs text-slate-500">₹{p.priceMin} - ₹{p.priceMax}</p>
                  <p className="text-[10px] text-slate-400 truncate">ID: {p._id}</p>
                </div>
              </div>

              <button
                onClick={() => setConfirmModal(p)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition flex-shrink-0"
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
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Product Removal</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{confirmModal.productName}"</strong>? This will remove the listing and delete its images from Cloudinary. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{deleting ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}