import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import { API_URL } from '../config';
import { useUIStore } from '../store/useUIStore';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = {
    title: '',
    subtitle: '',
    ctaText: '',
    ctaUrl: '',
    discountPercentage: 0,
    couponCode: '',
    targetRedirect: '',
    startDate: '',
    endDate: '',
    isActive: true,
    displayPriority: 0,
    type: 'Marketing Campaign',
    desktopImage: '',
    mobileImage: '',
    autoPlaySettings: { enabled: true, duration: 5000 }
  };
  
  const [formData, setFormData] = useState(initialForm);

  const { alert, confirm } = useUIStore();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/banners`);
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingId(banner._id);
      setFormData({
        ...banner,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''
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
      const url = editingId ? `${API_URL}/banners/${editingId}` : `${API_URL}/banners`;
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
        fetchBanners();
      } else {
        alert(data.message || 'Error saving banner', 'error', 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error', 'error', 'Error');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner?',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/banners/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            fetchBanners();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('autoPlaySettings.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        autoPlaySettings: {
          ...prev.autoPlaySettings,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
        alert('Upload failed: ' + (data.message || 'Unknown error'), 'error', 'Upload Error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during upload', 'error', 'Error');
    }
  };

  if (loading) return <div className="text-white p-6">Loading banners...</div>;

  const filteredBanners = banners.filter((banner) => {
    return banner.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Marketing Banners</h1>
          <p className="text-sm text-gray-400">Manage homepage hero banners and promotional carousels.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search banners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-vybe-neon transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-vybe-neon text-black rounded-lg text-sm font-semibold hover:shadow-[0_0_20px_rgba(163,255,18,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" /> New Banner
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-vybe-glassBorder bg-vybe-glass/30">
              <th className="p-4 text-sm font-semibold text-gray-300">Title</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Type</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Priority</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No banners found.</td>
              </tr>
            ) : (
              filteredBanners.map(banner => (
                <tr key={banner._id} className="border-b border-vybe-glassBorder hover:bg-vybe-glass/20 transition-colors">
                  <td className="p-4 text-white font-medium">{banner.title}</td>
                  <td className="p-4 text-sm text-gray-300">{banner.type}</td>
                  <td className="p-4 text-sm text-gray-300">{banner.displayPriority}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(banner)} className="p-2 bg-vybe-glass rounded-lg hover:text-vybe-neon transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="p-2 bg-vybe-glass rounded-lg hover:text-red-400 transition-colors">
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
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-vybe-glass rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white p-6 border-b border-vybe-glassBorder">
              {editingId ? 'Edit Banner' : 'Create Banner'}
            </h2>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subtitle</label>
                  <input name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none">
                    <option>Discount Banner</option>
                    <option>New Collection Banner</option>
                    <option>New Drop Banner</option>
                    <option>Marketing Campaign</option>
                    <option>Festival Sale</option>
                    <option>Announcement Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Priority (Higher = first)</label>
                  <input type="number" name="displayPriority" value={formData.displayPriority} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">CTA Text</label>
                  <input name="ctaText" value={formData.ctaText} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">CTA URL</label>
                  <input name="ctaUrl" value={formData.ctaUrl} onChange={handleChange} className="w-full bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Desktop Image (URL or Upload)</label>
                  <div className="flex gap-2">
                    <input name="desktopImage" value={formData.desktopImage} onChange={handleChange} placeholder="https://..." className="flex-1 bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none min-w-0" />
                    <label className="bg-vybe-glass border border-vybe-glassBorder hover:bg-vybe-glassBorder px-3 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'desktopImage')} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mobile Image (URL or Upload)</label>
                  <div className="flex gap-2">
                    <input name="mobileImage" value={formData.mobileImage} onChange={handleChange} placeholder="https://..." className="flex-1 bg-vybe-glass border border-vybe-glassBorder rounded-lg p-2.5 text-white focus:border-vybe-neon outline-none min-w-0" />
                    <label className="bg-vybe-glass border border-vybe-glassBorder hover:bg-vybe-glassBorder px-3 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'mobileImage')} />
                    </label>
                  </div>
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

              <div className="flex flex-wrap gap-6 pt-4 border-t border-vybe-glassBorder">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="accent-vybe-neon w-4 h-4" />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="autoPlaySettings.enabled" checked={formData.autoPlaySettings?.enabled} onChange={handleChange} className="accent-vybe-neon w-4 h-4" />
                  <span className="text-sm text-gray-300">AutoPlay</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-vybe-glass text-white rounded-lg hover:bg-vybe-glassBorder transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-vybe-neon text-black font-semibold rounded-lg hover:shadow-[0_0_15px_rgba(163,255,18,0.4)] transition-all">
                  {editingId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
