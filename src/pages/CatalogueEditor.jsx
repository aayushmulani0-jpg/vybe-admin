import { useState, useEffect } from 'react';
import { useCatalogueStore } from '../store/useCatalogueStore';
import { useProductStore } from '../store/useProductStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { BookOpen, Trash2, Plus, CheckCircle, Globe, X, ArrowLeft, Settings2 } from 'lucide-react';

export default function CatalogueEditor() {
  const { catalogues, fetchCatalogues, createCatalogue, setLiveCatalogue, deleteCatalogue, addCatalogueItem, removeCatalogueItem, updateCatalogueItem, addPrintPricing, removePrintPricing, updatePrintPricing } = useCatalogueStore();
  const { products: globalProducts, fetchProducts } = useProductStore();
  
  useEffect(() => {
    fetchCatalogues();
    fetchProducts();
  }, [fetchCatalogues, fetchProducts]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  // Master-Detail state
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const selectedCat = catalogues.find(c => c.id === selectedCatId);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCatalogue(newCatName);
    setNewCatName('');
    setShowCreateModal(false);
  };

  // Helper for adding new print pricing row
  const handleAddPrintRow = () => {
    addPrintPricing(selectedCatId, { sizeName: 'New Size', dimensionsCm: '10x10', price: 0 });
  };

  // --- DETAIL VIEW ---
  if (selectedCat) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedCatId(null)} className="p-2 text-gray-400 hover:text-white hover:bg-vybe-glass rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{selectedCat.name}</h1>
              <p className="text-sm text-gray-400">Manage products, MOQs, wholesale pricing, and custom print matrix.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="danger" onClick={() => { deleteCatalogue(selectedCat.id); setSelectedCatId(null); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            {selectedCat.isLive ? (
              <span className="bg-vybe-neon text-black text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 h-10">
                <Globe className="w-3 h-3" /> Live Catalogue
              </span>
            ) : (
              <Button variant="secondary" onClick={() => setLiveCatalogue(selectedCat.id)}>Publish as Live</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Products in Catalogue */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Catalogue Products</h2>
              <Button onClick={() => setShowProductSelector(true)}><Plus className="w-4 h-4 mr-2" /> Browse Products</Button>
            </div>
            
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Wholesale Price (₹)</th>
                      <th className="px-6 py-4">MOQ</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCat.items.map((item) => {
                      const globalProd = globalProducts.find(p => p.id === item.productId);
                      if (!globalProd) return null;

                      return (
                        <tr key={item.productId} className="border-b border-vybe-glassBorder/50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img src={globalProd.image} alt={globalProd.name} className="w-10 h-10 rounded object-cover" />
                            <div>
                              <p className="font-medium text-white">{globalProd.name}</p>
                              <p className="text-xs text-gray-500">Retail: ₹{globalProd.price}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              value={item.wholesalePrice}
                              onChange={(e) => updateCatalogueItem(selectedCat.id, item.productId, { wholesalePrice: Number(e.target.value) })}
                              className="bg-vybe-dark border border-vybe-glassBorder rounded px-2 py-1 w-24 text-white focus:border-vybe-neon focus:outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              value={item.moq}
                              onChange={(e) => updateCatalogueItem(selectedCat.id, item.productId, { moq: Number(e.target.value) })}
                              className="bg-vybe-dark border border-vybe-glassBorder rounded px-2 py-1 w-20 text-white focus:border-vybe-neon focus:outline-none"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => removeCatalogueItem(selectedCat.id, item.productId)} className="text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedCat.items.length === 0 && (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No products added to this catalogue.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Custom Print Matrix */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Custom Print Pricing</h2>
              <Button variant="secondary" onClick={handleAddPrintRow}><Plus className="w-4 h-4" /></Button>
            </div>

            <GlassCard className="p-4 space-y-4">
              <p className="text-xs text-gray-400 mb-4">Set pricing rules for custom prints applied to blanks in this catalogue.</p>
              
              {selectedCat.printPricing.map((pricing) => (
                <div key={pricing.id} className="grid grid-cols-12 gap-2 items-center bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder">
                  <div className="col-span-5">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Size Name</label>
                    <input 
                      type="text" 
                      value={pricing.sizeName}
                      onChange={(e) => updatePrintPricing(selectedCat.id, pricing.id, { sizeName: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-700 text-sm text-white focus:border-vybe-neon focus:outline-none pb-1"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Dim (cm)</label>
                    <input 
                      type="text" 
                      value={pricing.dimensionsCm}
                      onChange={(e) => updatePrintPricing(selectedCat.id, pricing.id, { dimensionsCm: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-700 text-sm text-white focus:border-vybe-neon focus:outline-none pb-1"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Price (₹)</label>
                    <input 
                      type="number" 
                      value={pricing.price}
                      onChange={(e) => updatePrintPricing(selectedCat.id, pricing.id, { price: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-gray-700 text-sm text-white focus:border-vybe-neon focus:outline-none pb-1"
                    />
                  </div>
                  <div className="col-span-1 text-right pt-4">
                    <button onClick={() => removePrintPricing(selectedCat.id, pricing.id)} className="text-gray-500 hover:text-red-400">
                      <X className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              ))}

              {selectedCat.printPricing.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  No print pricing rules defined.
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <GlassCard className="w-full max-w-2xl p-6 relative flex flex-col max-h-[80vh]">
              <button onClick={() => setShowProductSelector(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold text-white mb-6">Select Products to Add</h2>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-2">
                {globalProducts.map(prod => {
                  const isAdded = selectedCat.items.some(item => item.productId === prod.id);
                  return (
                    <div key={prod.id} className="flex items-center justify-between p-3 bg-vybe-dark rounded-lg border border-vybe-glassBorder">
                      <div className="flex items-center gap-3">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="font-medium text-white">{prod.name}</p>
                          <p className="text-xs text-gray-500">Retail: ₹{prod.price}</p>
                        </div>
                      </div>
                      <Button 
                        variant={isAdded ? "ghost" : "primary"} 
                        size="sm" 
                        disabled={isAdded}
                        onClick={() => addCatalogueItem(selectedCat.id, prod.id, Math.floor(prod.price * 0.6))} // Default wholesale to 60% of retail
                      >
                        {isAdded ? 'Added' : 'Add to Catalogue'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    );
  }

  // --- MASTER VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Wholesale Catalogues</h1>
          <p className="text-sm text-gray-400">Manage your product catalogues. Only one catalogue can be live for buyers to download.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Catalogue
        </Button>
      </div>

      {catalogues.length === 0 && !showCreateModal && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-vybe-dark rounded-full flex items-center justify-center mb-6 border border-vybe-glassBorder">
            <BookOpen className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Catalogues Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">You haven't created any wholesale catalogues yet. Create your first catalogue to start adding products and print matrices.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create First Catalogue
          </Button>
        </div>
      )}

      {catalogues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogues.map((cat) => (
            <GlassCard key={cat.id} className={`p-6 border transition-all duration-300 relative overflow-hidden ${cat.isLive ? 'border-vybe-neon shadow-[0_0_20px_rgba(163,255,18,0.1)]' : 'border-vybe-glassBorder hover:border-gray-500'}`}>
              
              {cat.isLive && (
                <div className="absolute top-0 right-0 bg-vybe-neon text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Live
                </div>
              )}

              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="p-3 bg-vybe-dark rounded-xl border border-vybe-glassBorder">
                  <BookOpen className={`w-6 h-6 ${cat.isLive ? 'text-vybe-neon' : 'text-gray-400'}`} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-400 mb-6">Created: {cat.dateCreated} • {cat.items?.length || 0} Products</p>

              <div className="flex items-center gap-3 pt-4 border-t border-vybe-glassBorder">
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={() => setSelectedCatId(cat.id)}
                  className="justify-center"
                >
                  <Settings2 className="w-4 h-4 mr-2" /> Configure
                </Button>
                
                <button 
                  onClick={() => deleteCatalogue(cat.id)} 
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Catalogue"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Create New Catalogue</h2>
            
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <Input 
                  label="Catalogue Name" 
                  placeholder="e.g. Winter 2026 Collection" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required 
                  autoFocus
                />
              </div>

              <div className="mt-8 flex gap-3">
                <Button type="button" variant="ghost" fullWidth onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" fullWidth>Create Draft</Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
