import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, DollarSign } from 'lucide-react';
const API_URL = 'http://localhost:5000/api';

export default function Pricing() {
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('vybe-admin-token');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch(`${API_URL}/pricing`);
      const data = await response.json();
      setPricingConfigs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (id, field, value) => {
    setPricingConfigs(prev => 
      prev.map(config => 
        config._id === id ? { ...config, [field]: value } : config
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create an array of update promises
      const updatePromises = pricingConfigs.map(config => {
        if (config._id) {
          return fetch(`${API_URL}/pricing/${config._id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(config)
          });
        } else {
          return fetch(`${API_URL}/pricing`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(config)
          });
        }
      });
      
      await Promise.all(updatePromises);
      alert('Pricing configurations saved successfully!');
      fetchPricing(); // Refresh to get proper IDs for new items
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing configurations.');
    }
    setSaving(false);
  };

  const addNewConfig = () => {
    setPricingConfigs([
      ...pricingConfigs,
      {
        name: 'New Fee',
        value: 0,
        currency: 'INR',
        type: 'fixed',
        description: ''
      }
    ]);
  };

  const handleDelete = async (id, index) => {
    if (!id) {
      // Remove from local state if it hasn't been saved yet
      const newConfigs = [...pricingConfigs];
      newConfigs.splice(index, 1);
      setPricingConfigs(newConfigs);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this pricing configuration?')) {
      try {
        await fetch(`${API_URL}/pricing/${id}`, { 
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPricing();
      } catch (error) {
        console.error('Error deleting config:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-vybe-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Global Pricing</h1>
            <p className="text-gray-400">Manage base fees, delivery charges, and other dynamic pricing configurations.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={addNewConfig}
              className="flex items-center gap-2 px-4 py-2 bg-vybe-dark border border-vybe-glassBorder text-white rounded-lg hover:bg-vybe-glass transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Fee
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-vybe-neon text-black font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-vybe-surface border border-vybe-glassBorder rounded-xl overflow-hidden">
          {pricingConfigs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pricing configurations found. Add one to get started.
            </div>
          ) : (
            <div className="divide-y divide-vybe-glassBorder">
              {pricingConfigs.map((config, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={config._id || index} 
                  className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Fee Name</label>
                        <input
                          type="text"
                          value={config.name}
                          onChange={(e) => handleInputChange(config._id, 'name', e.target.value)}
                          className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-vybe-neon focus:ring-1 focus:ring-vybe-neon transition-all"
                          placeholder="e.g., Delivery Fee"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Value</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            value={config.value}
                            onChange={(e) => handleInputChange(config._id, 'value', Number(e.target.value))}
                            className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 pl-9 text-white focus:outline-none focus:border-vybe-neon focus:ring-1 focus:ring-vybe-neon transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Description (Optional)</label>
                      <input
                        type="text"
                        value={config.description || ''}
                        onChange={(e) => handleInputChange(config._id, 'description', e.target.value)}
                        className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-vybe-neon focus:ring-1 focus:ring-vybe-neon transition-all"
                        placeholder="Explain when this fee applies..."
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(config._id, index)}
                    className="p-2 text-gray-500 hover:text-red-500 bg-vybe-dark border border-vybe-glassBorder rounded-lg hover:border-red-500/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
