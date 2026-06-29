import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../config';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    name: '',
    description: '',
    type: 'Regular Collection',
    startDate: '',
    endDate: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    countdownTimer: false,
    preOrderEnabled: false,
    bannerImage: '',
    coverImage: '',
    products: []
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_URL}/collections`);
      const data = await res.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleOpenModal = (collection = null) => {
    if (collection) {
      setEditingId(collection._id);
      setFormData({
        ...collection,
        products: collection.products ? collection.products.map(p => p._id || p) : [],
        startDate: collection.startDate ? new Date(collection.startDate).toISOString().slice(0, 16) : '',
        endDate: collection.endDate ? new Date(collection.endDate).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/collections/${editingId}` : `${API_URL}/collections`;
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCollections();
      } else {
        alert(data.message || 'Error saving collection');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`${API_URL}/collections/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => {
      const isSelected = prev.products.includes(productId);
      if (isSelected) {
        return { ...prev, products: prev.products.filter(id => id !== productId) };
      } else {
        return { ...prev, products: [...prev.products, productId] };
      }
    });
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, [field]: data.url }));
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error during upload');
    }
  };

  if (loading) return <div className="text-white p-6">Loading collections...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Collections & Drops</h1>
          <p className="text-sm text-gray-400">Manage your product collections, drops, and campaigns.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-vybe-neon text-black rounded-lg text-sm font-semibold hover:shadow-[0_0_20px_rgba(163,255,18,0.5)] transition-all"
        >
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-vybe-glassBorder bg-vybe-glass/30">
              <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Type</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Products</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No collections found.</td>
              </tr>
            ) : (
              collections.map(col => (
                <tr key={col._id} className="border-b border-vybe-glassBorder hover:bg-vybe-glass/20 transition-colors">
                  <td className="p-4 text-white font-medium">{col.name}</td>
                  <td className="p-4 text-sm text-gray-300">{col.type}</td>
                  <td className="p-4 text-sm text-gray-300">{col.products?.length || 0} items</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${col.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {col.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(col)} className="p-2 bg-vybe-glass rounded-lg hover:text-vybe-neon transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(col._id)} className="p-2 bg-vybe-glass rounded-lg hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-vybe-surface border border-vybe-glassBorder rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-vybe-glass rounded-full transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white p-6 border-b border-vybe-glassBorder">
              {editingId ? 'Edit Collection' : 'Create Collection'}
            </h2>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none h-24" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none">
                    <option>Regular Collection</option>
                    <option>New Drop</option>
                    <option>Limited Edition</option>
                    <option>Seasonal Collection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date (Optional)</label>
                  <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date (Optional)</label>
                  <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Banner Image (URL or Upload)</label>
                  <div className="flex gap-2">
                    <input name="bannerImage" value={formData.bannerImage} onChange={handleChange} placeholder="https://..." className="flex-1 bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none min-w-0" />
                    <label className="bg-vybe-glass border border-vybe-glassBorder hover:bg-vybe-glassBorder px-3 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bannerImage')} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cover Image (URL or Upload)</label>
                  <div className="flex gap-2">
                    <input name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://..." className="flex-1 bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none min-w-0" />
                    <label className="bg-vybe-glass border border-vybe-glassBorder hover:bg-vybe-glassBorder px-3 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'coverImage')} />
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Product Selection */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign Products ({formData.products.length} selected)</label>
                <div className="bg-vybe-glass border border-vybe-glassBorder rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {allProducts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No products available.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allProducts.map(product => (
                        <label key={product._id} className="flex items-center gap-3 p-2 hover:bg-vybe-glassBorder rounded-md cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.products.includes(product._id)}
                            onChange={() => handleProductToggle(product._id)}
                            className="accent-vybe-neon w-4 h-4"
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            {product.images && product.images[0] && (
                              <img src={product.images[0]} alt="" className="w-6 h-6 object-cover rounded shrink-0" />
                            )}
                            <span className="text-sm text-gray-300 truncate">{product.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-vybe-glassBorder">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="accent-vybe-neon w-4 h-4" />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="accent-vybe-neon w-4 h-4" />
                  <span className="text-sm text-gray-300">Featured on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="countdownTimer" checked={formData.countdownTimer} onChange={handleChange} className="accent-vybe-neon w-4 h-4" />
                  <span className="text-sm text-gray-300">Show Countdown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="preOrderEnabled" checked={formData.preOrderEnabled} onChange={handleChange} className="accent-vybe-neon w-4 h-4" />
                  <span className="text-sm text-gray-300">Enable Pre-Orders</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-vybe-glass text-white rounded-lg hover:bg-vybe-glassBorder transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-vybe-neon text-black font-semibold rounded-lg hover:shadow-[0_0_15px_rgba(163,255,18,0.4)] transition-all">
                  {editingId ? 'Update Collection' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
