import { useState, useEffect } from 'react';
import { usePrintSettingsStore } from '../../store/usePrintSettingsStore';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { X, Save, MapPin, Layers } from 'lucide-react';

export default function WholesalePrintSettingsModal({ catalogue, onSave, onClose }) {
  const { printLocations, fetchPrintLocations } = usePrintSettingsStore();
  const [activeTab, setActiveTab] = useState('areas'); // 'areas' or 'templates'
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Local state for wholesale overrides
  const [localLocations, setLocalLocations] = useState([]);
  const [localTemplates, setLocalTemplates] = useState([]);

  useEffect(() => {
    fetchPrintLocations();
    fetchTemplates();
  }, [fetchPrintLocations]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await fetch(`http://localhost:5000/api/templates`);
      if (res.ok) setGlobalTemplates(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (printLocations.length > 0) {
      const catalogueLocs = catalogue.wholesaleLocations || [];
      const mergedLocs = printLocations.map(globalLoc => {
        const override = catalogueLocs.find(cl => cl.locationId === globalLoc._id);
        if (override) {
          return { ...override };
        }
        return {
          locationId: globalLoc._id,
          name: globalLoc.name,
          wholesaleCost: Math.max(0, Math.floor((globalLoc.cost || 0) * 0.7)), // default 30% off
          isActive: true
        };
      });
      setLocalLocations(mergedLocs);
    }
  }, [printLocations, catalogue]);

  useEffect(() => {
    if (globalTemplates.length > 0) {
      const catalogueTpls = catalogue.wholesaleTemplates || [];
      const mergedTpls = globalTemplates.map(globalTpl => {
        const override = catalogueTpls.find(ct => ct.templateId === globalTpl._id);
        if (override) {
          return { ...override };
        }
        return {
          templateId: globalTpl._id,
          name: globalTpl.name,
          wholesalePrice: Math.max(0, Math.floor((globalTpl.price || 0) * 0.7)),
          isActive: true
        };
      });
      setLocalTemplates(mergedTpls);
    }
  }, [globalTemplates, catalogue]);

  const handleSave = () => {
    onSave(localLocations, localTemplates);
  };

  const handleUpdateLocation = (locationId, updates) => {
    setLocalLocations(prev => prev.map(loc => loc.locationId === locationId ? { ...loc, ...updates } : loc));
  };

  const handleUpdateTemplate = (templateId, updates) => {
    setLocalTemplates(prev => prev.map(tpl => tpl.templateId === templateId ? { ...tpl, ...updates } : tpl));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl relative">
        <button onClick={onClose} className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors z-10">
          <X className="w-8 h-8" />
        </button>
        <GlassCard className="p-6 h-[85vh] flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0 border-b border-vybe-glassBorder pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Wholesale Print Management</h2>
              <p className="text-sm text-gray-400">Set wholesale-specific pricing for global print areas and templates.</p>
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

          <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 pr-2">
            {activeTab === 'areas' && (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
                  <tr>
                    <th className="px-6 py-4">Zone Name</th>
                    <th className="px-6 py-4">Global Retail Price</th>
                    <th className="px-6 py-4">Wholesale Price (₹)</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {localLocations.map(loc => {
                    const globalLoc = printLocations.find(gl => gl._id === loc.locationId);
                    return (
                      <tr key={loc.locationId} className={`border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors ${!loc.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-white">{loc.name}</td>
                        <td className="px-6 py-4 text-gray-500">₹{globalLoc?.cost || 0}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            value={loc.wholesaleCost}
                            onChange={(e) => handleUpdateLocation(loc.locationId, { wholesaleCost: Number(e.target.value) })}
                            disabled={!loc.isActive}
                            className="bg-vybe-dark border border-vybe-glassBorder rounded px-2 py-1 w-24 text-white focus:border-vybe-neon focus:outline-none disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={loc.isActive}
                              onChange={(e) => handleUpdateLocation(loc.locationId, { isActive: e.target.checked })}
                              className="w-4 h-4 accent-vybe-neon"
                            />
                            <span>{loc.isActive ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === 'templates' && (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
                  <tr>
                    <th className="px-6 py-4">Template Name</th>
                    <th className="px-6 py-4">Global Retail Price</th>
                    <th className="px-6 py-4">Wholesale Price (₹)</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTemplates ? (
                     <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading templates...</td></tr>
                  ) : localTemplates.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No global templates found.</td></tr>
                  ) : localTemplates.map(tpl => {
                    const globalTpl = globalTemplates.find(gt => gt._id === tpl.templateId);
                    return (
                      <tr key={tpl.templateId} className={`border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors ${!tpl.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{tpl.name}</p>
                          {globalTpl?.printAreas && (
                            <p className="text-[10px] text-gray-500 mt-1">{globalTpl.printAreas.map(pa => pa.name).join(', ')}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">₹{globalTpl?.price || 0}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            value={tpl.wholesalePrice}
                            onChange={(e) => handleUpdateTemplate(tpl.templateId, { wholesalePrice: Number(e.target.value) })}
                            disabled={!tpl.isActive}
                            className="bg-vybe-dark border border-vybe-glassBorder rounded px-2 py-1 w-24 text-white focus:border-vybe-neon focus:outline-none disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={tpl.isActive}
                              onChange={(e) => handleUpdateTemplate(tpl.templateId, { isActive: e.target.checked })}
                              className="w-4 h-4 accent-vybe-neon"
                            />
                            <span>{tpl.isActive ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="shrink-0 pt-4 border-t border-vybe-glassBorder flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Settings to Catalogue</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
