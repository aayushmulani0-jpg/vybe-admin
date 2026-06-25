import { useState, useEffect } from 'react';
import { usePrintSettingsStore } from '../store/usePrintSettingsStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { MapPin, Power, Save, Layers, Edit2, Trash2, Plus, X, Check, Star } from 'lucide-react';
import { API_URL } from '../config';

export default function PrintSettings() {
  const { printLocations, fetchPrintLocations, updateLocation, loading } = usePrintSettingsStore();
  const [activeTab, setActiveTab] = useState('areas'); // 'areas' or 'templates'

  // --- Print Areas State ---
  const [localLocations, setLocalLocations] = useState([]);
  const [isSavingAreas, setIsSavingAreas] = useState(false);

  // --- Templates State ---
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({
    name: '', description: '', price: 0, printAreas: [], isActive: true, isRecommended: false, isPopular: false
  });
  
  const token = localStorage.getItem('vybe-admin-token'); 

  useEffect(() => {
    fetchPrintLocations();
    fetchTemplates();
  }, [fetchPrintLocations]);

  useEffect(() => {
    if (printLocations) {
      setLocalLocations(JSON.parse(JSON.stringify(printLocations))); 
    }
  }, [printLocations]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await fetch(`${API_URL}/templates`);
      if (res.ok) setTemplates(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // --- Print Areas Logic ---
  const handleToggleArea = (id) => {
    setLocalLocations(prev => prev.map(loc => 
      loc._id === id ? { ...loc, isActive: !loc.isActive } : loc
    ));
  };

  const handlePriceChangeArea = (id, newPrice) => {
    setLocalLocations(prev => prev.map(loc => 
      loc._id === id ? { ...loc, cost: Number(newPrice) } : loc
    ));
  };

  const handleSaveAreas = async () => {
    setIsSavingAreas(true);
    try {
      const promises = localLocations.map(loc => updateLocation(loc._id, { cost: loc.cost, isActive: loc.isActive }));
      await Promise.all(promises);
      await fetchPrintLocations();
      alert('Print settings saved successfully!');
    } catch (error) {
      console.error('Error saving print settings:', error);
      alert('Failed to save settings.');
    }
    setIsSavingAreas(false);
  };

  // --- Templates Logic ---
  const handleSaveTemplate = async () => {
    try {
      const method = currentTemplate._id ? 'PUT' : 'POST';
      const url = currentTemplate._id ? `${API_URL}/templates/${currentTemplate._id}` : `${API_URL}/templates`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(currentTemplate)
      });
      
      if (res.ok) {
        fetchTemplates();
        setIsEditingTemplate(false);
      } else {
        const errorData = await res.json();
        alert(`Failed to save template: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving template.');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await fetch(`${API_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePrintAreaInTemplate = (areaName) => {
    setCurrentTemplate(prev => {
      const exists = prev.printAreas.find(p => p.name === areaName);
      if (exists) {
        return { ...prev, printAreas: prev.printAreas.filter(p => p.name !== areaName) };
      } else {
        return { ...prev, printAreas: [...prev.printAreas, { name: areaName }] };
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Print Management</h1>
          <p className="text-sm text-gray-400">Configure print zones, pricing, and preset templates.</p>
        </div>
        <div className="flex bg-vybe-dark p-1 rounded-lg border border-vybe-glassBorder">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'areas' ? 'bg-vybe-glass border border-vybe-glassBorder text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('areas')}
          >
            Print Areas
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-vybe-glass border border-vybe-glassBorder text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </div>
      </div>

      {activeTab === 'areas' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleSaveAreas} disabled={isSavingAreas || loading}>
              <Save className="w-4 h-4 mr-2" />
              {isSavingAreas ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
                  <tr>
                    <th className="px-6 py-4">Zone Name</th>
                    <th className="px-6 py-4">Price (₹)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading locations...</td>
                    </tr>
                  ) : localLocations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-vybe-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-vybe-glassBorder">
                          <MapPin className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No Print Locations</h3>
                        <p className="text-sm text-gray-400 max-w-sm mx-auto">Please seed the database with initial print locations to see them here.</p>
                      </td>
                    </tr>
                  ) : (
                    localLocations.map((loc) => (
                      <tr key={loc._id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{loc.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">₹</span>
                            <input 
                              type="number"
                              value={loc.cost}
                              onChange={(e) => handlePriceChangeArea(loc._id, e.target.value)}
                              className="w-24 bg-transparent border-b border-gray-600 focus:border-vybe-neon focus:outline-none text-white pb-1"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${loc.isActive ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                            {loc.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleToggleArea(loc._id)}
                            className={`p-2 rounded-lg transition-colors ${loc.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                            title={loc.isActive ? 'Disable Location' : 'Enable Location'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {!isEditingTemplate ? (
            <>
              <div className="flex justify-end">
                <Button onClick={() => {
                  setCurrentTemplate({ name: '', description: '', price: 0, printAreas: [], isActive: true, isRecommended: false, isPopular: false });
                  setIsEditingTemplate(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                  <GlassCard key={template._id} className="p-6 relative group border-vybe-glassBorder hover:border-gray-500 transition-colors">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setCurrentTemplate(template); setIsEditingTemplate(true); }} className="p-2 bg-vybe-dark rounded text-gray-400 hover:text-vybe-neon">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTemplate(template._id)} className="p-2 bg-vybe-dark rounded text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{template.name}</h3>
                      {!template.isActive && <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{template.description || 'No description'}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-vybe-dark border border-vybe-glassBorder text-white rounded">
                        Price: ₹{template.price}
                      </span>
                      {template.isRecommended && <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-vybe-neon/10 border border-vybe-neon/30 text-vybe-neon rounded"><Star className="w-3 h-3" /> Recommended</span>}
                      {template.isPopular && <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded"><Star className="w-3 h-3" /> Popular</span>}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Included Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {template.printAreas.map(p => (
                          <span key={p.name} className="text-xs px-2 py-1 bg-vybe-dark border border-vybe-glassBorder text-gray-300 rounded">{p.name}</span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                ))}
                
                {templates.length === 0 && !isLoadingTemplates && (
                  <div className="col-span-full text-center py-16 border border-dashed border-gray-700 rounded-xl">
                    <Layers className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No templates found.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-vybe-glassBorder pb-4">
                <h2 className="text-xl font-bold text-white">{currentTemplate._id ? 'Edit Template' : 'Create Template'}</h2>
                <button onClick={() => setIsEditingTemplate(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Template Name</label>
                  <input 
                    type="text" 
                    value={currentTemplate.name} 
                    onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                    className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-md p-3 text-white focus:border-vybe-neon outline-none"
                    placeholder="e.g. Streetwear Combo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Template Override Price (₹)</label>
                  <input 
                    type="number" 
                    value={currentTemplate.price} 
                    onChange={e => setCurrentTemplate({...currentTemplate, price: Number(e.target.value)})}
                    className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-md p-3 text-white focus:border-vybe-neon outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <input 
                    type="text" 
                    value={currentTemplate.description} 
                    onChange={e => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                    className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-md p-3 text-white focus:border-vybe-neon outline-none"
                    placeholder="e.g. Chest Design + Large Back"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Select Included Print Areas</label>
                <div className="flex flex-wrap gap-3">
                  {printLocations.map(area => {
                    const isSelected = currentTemplate.printAreas.some(p => p.name === area.name);
                    return (
                      <button
                        key={area._id}
                        onClick={() => togglePrintAreaInTemplate(area.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-vybe-neon/10 border-vybe-neon/50 text-vybe-neon' : 'bg-vybe-dark border-vybe-glassBorder text-gray-300 hover:border-gray-500'}`}
                      >
                        {isSelected && <Check className="w-4 h-4" />} {area.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-6 mb-8 border-t border-vybe-glassBorder pt-6">
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                  <input 
                    type="checkbox" 
                    checked={currentTemplate.isActive} 
                    onChange={e => setCurrentTemplate({...currentTemplate, isActive: e.target.checked})}
                    className="w-4 h-4 accent-vybe-neon"
                  />
                  <span>Active (Visible to users)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                  <input 
                    type="checkbox" 
                    checked={currentTemplate.isRecommended} 
                    onChange={e => setCurrentTemplate({...currentTemplate, isRecommended: e.target.checked})}
                    className="w-4 h-4 accent-vybe-neon"
                  />
                  <span>Mark as Recommended</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                  <input 
                    type="checkbox" 
                    checked={currentTemplate.isPopular} 
                    onChange={e => setCurrentTemplate({...currentTemplate, isPopular: e.target.checked})}
                    className="w-4 h-4 accent-vybe-neon"
                  />
                  <span>Mark as Popular</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setIsEditingTemplate(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveTemplate}><Save className="w-4 h-4 mr-2" /> Save Template</Button>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
