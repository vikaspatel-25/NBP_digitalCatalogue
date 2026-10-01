import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, X, Loader2, Plus, Info } from 'lucide-react';

export default function AddProduct({ apiEndpoint = '/api/admin/addProduct', role = 'admin' }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [articleLinks, setArticleLinks] = useState(['']);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) return alert('Max 10 images allowed');
    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, { name: file.name, url: ev.target.result }]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = (setter) => setter(prev => [...prev, '']);
  const updateLink = (setter, index, value) => {
    setter(prev => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };
  const removeLink = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    
    // Clear out standard files from FormData to manually append them
    formData.delete('images');
    formData.delete('videos');
    
    images.forEach(img => formData.append('images', img));
    videos.forEach(vid => formData.append('videos', vid));

    // Links are already in formData if they have name attribute, but to be safe:
    formData.delete('youtubeLinks[]');
    formData.delete('articleLinks[]');
    youtubeLinks.filter(l => l).forEach(l => formData.append('youtubeLinks[]', l));
    articleLinks.filter(l => l).forEach(l => formData.append('articleLinks[]', l));

    try {
      const res = await axios.post(apiEndpoint, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setSuccess(true);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-green-100 text-green-800 p-6 rounded-full mb-6">
          <UploadCloud size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Product Added Successfully!</h2>
        <p className="text-gray-600 mb-8">Your product has been saved to the catalogue.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add Another Product
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-900 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Add New Product</h1>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Basic Product Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="productName" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Placement</label>
                <select name="listingPlacement" className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="top">Push to top</option>
                  <option value="bottom">Push to bottom</option>
                </select>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price *</label>
                  <input type="text" name="priceMin" required placeholder="e.g. 100" className="w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price *</label>
                  <input type="text" name="priceMax" required placeholder="e.g. 500" className="w-full border border-gray-300 rounded-md p-2" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Note</label>
                <input type="text" name="priceNote" placeholder="e.g. Per unit / Per meter / Per piece" className="w-full border border-gray-300 rounded-md p-2" />
              </div>
            </div>
          </section>

          {/* Descriptions */}
          <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Descriptions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                <textarea name="shortDescription" required rows="2" className="w-full border border-gray-300 rounded-md p-2"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                <textarea name="detailedDescription" required rows="4" className="w-full border border-gray-300 rounded-md p-2"></textarea>
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Media</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (Max 10) *</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
              
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="relative group w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-white">
                    <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Videos (Max 5)</label>
              <input type="file" multiple accept="video/*" onChange={e => setVideos(Array.from(e.target.files))} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">YouTube Links</label>
                  <button type="button" onClick={() => addLink(setYoutubeLinks)} className="text-blue-600 text-xs flex items-center hover:underline"><Plus size={12} className="mr-1"/> Add Link</button>
                </div>
                <div className="space-y-2">
                  {youtubeLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="url" value={link} onChange={e => updateLink(setYoutubeLinks, idx, e.target.value)} placeholder="https://youtube.com/..." className="flex-1 border border-gray-300 rounded-md p-2 text-sm" />
                      {youtubeLinks.length > 1 && (
                        <button type="button" onClick={() => removeLink(setYoutubeLinks, idx)} className="text-red-500 p-2"><X size={16}/></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Article Links</label>
                  <button type="button" onClick={() => addLink(setArticleLinks)} className="text-blue-600 text-xs flex items-center hover:underline"><Plus size={12} className="mr-1"/> Add Link</button>
                </div>
                <div className="space-y-2">
                  {articleLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="url" value={link} onChange={e => updateLink(setArticleLinks, idx, e.target.value)} placeholder="https://..." className="flex-1 border border-gray-300 rounded-md p-2 text-sm" />
                      {articleLinks.length > 1 && (
                        <button type="button" onClick={() => removeLink(setArticleLinks, idx)} className="text-red-500 p-2"><X size={16}/></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-8 rounded-lg flex items-center transition-colors"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Uploading Media & Saving...</>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
