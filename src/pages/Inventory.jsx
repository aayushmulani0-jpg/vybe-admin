import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageDropzone from '../components/common/ImageDropzone';
import { Package, Trash2, Plus, Edit2, X, Search } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export default function Inventory() {
  const { 
    products, 
    addProduct, 
    deleteProduct,
    updateProduct,
    toggleStock,
    fetchProducts
  } = useProductStore();
  const { alert, confirm } = useUIStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const initialFormState = {
    name: '',
    price: '',
    comparePrice: '',
    stockStatus: 'In Stock',
    discountBadge: '',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
    images: [],
    sizes: [],
    outOfStockSizes: [],
    colors: [],
    outOfStockColors: [],
    allowCustomPrint: false,
    isBestSeller: false,
    isRecommended: false,
    isNewArrival: false
  };

  // Form State
  const [newProduct, setNewProduct] = useState(initialFormState);

  const [colorInput, setColorInput] = useState('#000000');

  const handleAddColor = () => {
    if (!newProduct.colors.includes(colorInput)) {
      setNewProduct(prev => ({ ...prev, colors: [...prev.colors, colorInput] }));
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setNewProduct(prev => ({ ...prev, colors: prev.colors.filter(c => c !== colorToRemove) }));
  };

  const handleSizeToggle = (size) => {
    setNewProduct(prev => {
      const isSelected = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: isSelected 
          ? prev.sizes.filter(s => s !== size)
          : [...prev.sizes, size],
        outOfStockSizes: isSelected 
          ? prev.outOfStockSizes.filter(s => s !== size) 
          : prev.outOfStockSizes
      };
    });
  };

  const handleStockToggle = (type, value) => {
    setNewProduct(prev => {
      const list = prev[type] || [];
      return {
        ...prev,
        [type]: list.includes(value) 
          ? list.filter(item => item !== value)
          : [...list, value]
      };
    });
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      stockStatus: product.stockStatus || 'In Stock',
      discountBadge: product.discountBadge || '',
      image: product.image || '',
      images: product.images || [],
      sizes: product.sizes || [],
      outOfStockSizes: product.outOfStockSizes || [],
      colors: product.colors || [],
      outOfStockColors: product.outOfStockColors || [],
      allowCustomPrint: product.allowCustomPrint || false,
      isBestSeller: product.isBestSeller || false,
      isRecommended: product.isRecommended || false,
      isNewArrival: product.isNewArrival || false
    });
    setShowAddForm(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    
    // Strict validation
    if (!newProduct.name || !newProduct.price || !newProduct.comparePrice) {
      alert("Please fill in all price and name fields.", "error", "Missing Fields");
      return;
    }
    if (newProduct.sizes.length === 0) {
      alert("Please select at least one size.", "error", "Missing Sizes");
      return;
    }
    if (newProduct.colors.length === 0) {
      alert("Please add at least one color.", "error", "Missing Colors");
      return;
    }
    if (!newProduct.image) {
      alert("Please upload a product image.", "error", "Missing Image");
      return;
    }

    const payload = {
      ...newProduct,
      price: Number(newProduct.price),
      comparePrice: newProduct.comparePrice ? Number(newProduct.comparePrice) : null,
      images: newProduct.images.filter(img => img.trim() !== '') // Clean empty URLs
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewProduct(initialFormState);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-sm text-gray-400">Manage your product stock, badges, prices, and catalog.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-vybe-neon transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button onClick={() => {
            setEditingId(null);
            setNewProduct(initialFormState);
            setShowAddForm(!showAddForm);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {(() => {
        const filteredProducts = products.filter(product => {
          const query = searchQuery.toLowerCase();
          return product.name?.toLowerCase().includes(query) || product.id?.toLowerCase().includes(query);
        });

        return (
          <>
            {showAddForm && (
        <GlassCard className="p-6 relative">
          <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-vybe-glass rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold mb-4 text-white">{editingId ? 'Edit Product' : 'List New Product'}</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                <Input 
                  label="Product Name" 
                  placeholder="e.g. Graphic Tee" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Selling Price (₹)" 
                    type="number" 
                    placeholder="1499" 
                    value={newProduct.price}
                    onChange={(e) => {
                      const price = e.target.value;
                      setNewProduct(prev => {
                        const compare = prev.comparePrice;
                        const discount = (compare && price && Number(price) < Number(compare)) ? Math.round(((Number(compare) - Number(price)) / Number(compare)) * 100) : '';
                        return { ...prev, price, discountBadge: discount ? `${discount}% OFF` : '' };
                      });
                    }}
                    required 
                  />
                  <Input 
                    label="Original Price (₹)" 
                    type="number" 
                    placeholder="1999" 
                    value={newProduct.comparePrice}
                    onChange={(e) => {
                      const comparePrice = e.target.value;
                      setNewProduct(prev => {
                        const price = prev.price;
                        const discount = (comparePrice && price && Number(price) < Number(comparePrice)) ? Math.round(((Number(comparePrice) - Number(price)) / Number(comparePrice)) * 100) : '';
                        return { ...prev, comparePrice, discountBadge: discount ? `${discount}% OFF` : '' };
                      });
                    }}
                    required
                  />
                </div>
                <Input 
                  label="Discount (%)" 
                  placeholder="e.g. 20" 
                  value={newProduct.discountBadge.replace(/[^0-9]/g, '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const discount = Number(val);
                    setNewProduct(prev => {
                      const comparePrice = prev.comparePrice;
                      if (comparePrice && val) {
                        const price = Math.round(Number(comparePrice) * (1 - discount / 100));
                        return { ...prev, price: String(price), discountBadge: `${val}% OFF` };
                      }
                      return { ...prev, discountBadge: val ? `${val}% OFF` : '' };
                    });
                  }}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Available Sizes</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                            newProduct.sizes?.includes(size)
                              ? 'bg-vybe-neon text-black'
                              : 'bg-vybe-dark text-gray-400 border border-vybe-glassBorder hover:border-vybe-neon'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {newProduct.sizes?.length > 0 && (
                      <div className="p-3 bg-vybe-dark rounded-lg border border-vybe-glassBorder">
                        <label className="block text-xs font-medium text-gray-400 mb-2">Mark specific sizes as Out of Stock:</label>
                        <div className="flex gap-2 flex-wrap">
                          {newProduct.sizes.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleStockToggle('outOfStockSizes', size)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                newProduct.outOfStockSizes?.includes(size)
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                  : 'bg-transparent text-gray-400 border border-vybe-glassBorder hover:border-gray-500'
                              }`}
                            >
                              {size} {newProduct.outOfStockSizes?.includes(size) ? '(OOS)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Available Colors</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="color" 
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>Add Color</Button>
                  </div>
                  {newProduct.colors?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {newProduct.colors.map(color => (
                          <div key={color} className="relative group cursor-pointer" onClick={() => handleRemoveColor(color)} title="Click to remove">
                            <div className={`w-6 h-6 rounded border ${newProduct.outOfStockColors?.includes(color) ? 'border-red-500 opacity-50' : 'border-gray-600'}`} style={{ backgroundColor: color }}></div>
                            <div className="absolute inset-0 bg-red-500/80 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Trash2 className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-vybe-dark rounded-lg border border-vybe-glassBorder">
                        <label className="block text-xs font-medium text-gray-400 mb-2">Mark specific colors as Out of Stock:</label>
                        <div className="flex gap-2 flex-wrap">
                          {newProduct.colors.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleStockToggle('outOfStockColors', color)}
                              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
                                newProduct.outOfStockColors?.includes(color)
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                  : 'bg-transparent text-gray-400 border border-vybe-glassBorder hover:border-gray-500'
                              }`}
                            >
                              <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: color }}></div>
                              {newProduct.outOfStockColors?.includes(color) ? 'OOS' : 'In Stock'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Display Picture (Main)</label>
                  <ImageDropzone 
                    value={newProduct.image}
                    onChange={(url) => setNewProduct({ ...newProduct, image: url })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Extra Images</label>
                  <div className="space-y-2">
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input 
                          placeholder="Image URL" 
                          value={img} 
                          onChange={(e) => {
                            const newImages = [...newProduct.images];
                            newImages[idx] = e.target.value;
                            setNewProduct({ ...newProduct, images: newImages });
                          }} 
                        />
                        <button type="button" onClick={() => {
                          const newImages = newProduct.images.filter((_, i) => i !== idx);
                          setNewProduct({ ...newProduct, images: newImages });
                        }} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setNewProduct({ ...newProduct, images: [...newProduct.images, ''] })}>
                      <Plus className="w-4 h-4 mr-1" /> Add Extra Image
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder hover:border-vybe-neon transition-colors">
                    <input 
                      type="checkbox"
                      checked={newProduct.allowCustomPrint}
                      onChange={(e) => setNewProduct({ ...newProduct, allowCustomPrint: e.target.checked })}
                      className="w-4 h-4 accent-vybe-neon"
                    />
                    <span className="text-sm font-medium text-white">Allow Custom Prints on this Product</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 pl-1">If checked, users will see the "Want Custom Prints?" button for this product.</p>
                </div>
                <div className="pt-4 border-t border-vybe-glassBorder space-y-3">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Display Tags</label>
                  <label className="flex items-center gap-2 cursor-pointer bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder hover:border-vybe-neon transition-colors">
                    <input type="checkbox" checked={newProduct.isBestSeller} onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })} className="w-4 h-4 accent-vybe-neon" />
                    <span className="text-sm font-medium text-white">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder hover:border-vybe-neon transition-colors">
                    <input type="checkbox" checked={newProduct.isRecommended} onChange={(e) => setNewProduct({ ...newProduct, isRecommended: e.target.checked })} className="w-4 h-4 accent-vybe-neon" />
                    <span className="text-sm font-medium text-white">Recommended</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder hover:border-vybe-neon transition-colors">
                    <input type="checkbox" checked={newProduct.isNewArrival} onChange={(e) => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })} className="w-4 h-4 accent-vybe-neon" />
                    <span className="text-sm font-medium text-white">New Arrival</span>
                  </label>
                </div>
              </div>

            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-vybe-glassBorder">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">{editingId ? 'Save Changes' : 'Publish Product'}</Button>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Sizes & Colors</th>
                <th className="px-6 py-4">Selling Price (₹)</th>
                <th className="px-6 py-4">Original Price (₹)</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Label / Discount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3 min-w-[250px]">
                    <div className="w-12 h-12 rounded overflow-hidden bg-vybe-dark shrink-0 border border-vybe-glassBorder">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="line-clamp-1 font-semibold">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 mb-1">ID: {product.id}</p>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={product.allowCustomPrint}
                          onChange={(e) => updateProduct(product.id, { allowCustomPrint: e.target.checked })}
                          className="w-3 h-3 accent-vybe-neon"
                        />
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Custom Prints</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {product.sizes && product.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map(size => {
                            const isOOS = product.outOfStockSizes?.includes(size);
                            return (
                              <span key={size} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                isOOS 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30 line-through' 
                                  : 'bg-vybe-dark text-gray-300 border-gray-600'
                              }`}>
                                {size}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 block">-</span>
                      )}
                      
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.colors.map(color => {
                            const isOOS = product.outOfStockColors?.includes(color);
                            return (
                              <div key={color} className="relative">
                                <div className={`w-3 h-3 rounded-full border border-gray-600 ${isOOS ? 'opacity-50' : ''}`} style={{ backgroundColor: color }} title={color + (isOOS ? ' (Out of Stock)' : '')}></div>
                                {isOOS && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-0.5 bg-red-500 rotate-45 absolute"></div></div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => {
                        const newPrice = Number(e.target.value);
                        const updates = { price: newPrice };
                        if (product.comparePrice && newPrice < product.comparePrice) {
                          updates.discountBadge = Math.round(((product.comparePrice - newPrice) / product.comparePrice) * 100) + '% OFF';
                        }
                        updateProduct(product.id, updates);
                      }}
                      className="w-20 bg-transparent border-b border-gray-600 focus:border-vybe-neon focus:outline-none text-white pb-1"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={product.comparePrice || ''}
                      placeholder="N/A"
                      onChange={(e) => {
                        const newComparePrice = Number(e.target.value);
                        const updates = { comparePrice: newComparePrice };
                        if (newComparePrice && product.price && product.price < newComparePrice) {
                          updates.discountBadge = Math.round(((newComparePrice - product.price) / newComparePrice) * 100) + '% OFF';
                        }
                        updateProduct(product.id, updates);
                      }}
                      className="w-20 bg-transparent border-b border-gray-600 focus:border-vybe-neon focus:outline-none text-gray-400 pb-1"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStock(product.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        product.stockStatus === 'In Stock' 
                          ? 'text-green-400 bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                          : 'text-red-400 bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                      }`}
                    >
                      {product.stockStatus}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={product.discountBadge ? product.discountBadge.replace(/[^0-9]/g, '') : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        const newDiscount = Number(val);
                        const updates = { discountBadge: val ? `${val}% OFF` : '' };
                        if (product.comparePrice && val) {
                          updates.price = Math.round(product.comparePrice * (1 - newDiscount / 100));
                        }
                        updateProduct(product.id, updates);
                      }}
                      placeholder="%"
                      className="bg-vybe-dark border border-transparent hover:border-vybe-glassBorder rounded px-2 py-1 text-sm w-16 focus:outline-none focus:border-vybe-neon text-white transition-colors"
                    /> <span className="text-gray-400 text-xs">%</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => handleEditClick(product)} className="p-2 text-gray-400 hover:text-vybe-neon transition-colors rounded-lg hover:bg-vybe-neon/10" title="Edit Product">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => {
                      confirm({
                        title: 'Delete Product',
                        message: `Are you sure you want to delete ${product.name}?`,
                        confirmText: 'Delete',
                        onConfirm: () => deleteProduct(product.id)
                      });
                    }} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" title="Delete Product">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-vybe-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-vybe-glassBorder">
                      <Package className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Inventory is Empty</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">You haven't added any products to your store yet. Click the button below to list your first item.</p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Your First Product
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
          </>
        );
      })()}
    </div>
  );
}
