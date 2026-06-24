import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageDropzone from '../components/common/ImageDropzone';
import { Package, Trash2, Plus } from 'lucide-react';

export default function Inventory() {
  const { 
    products, 
    addProduct, 
    deleteProduct,
    updateProduct,
    toggleStock,
    fetchProducts
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    comparePrice: '',
    stockStatus: 'In Stock',
    discountBadge: '',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    addProduct({
      ...newProduct,
      price: Number(newProduct.price),
      comparePrice: newProduct.comparePrice ? Number(newProduct.comparePrice) : null,
    });
    setShowAddForm(false);
    setNewProduct({ name: '', price: '', comparePrice: '', stockStatus: 'In Stock', discountBadge: '', image: newProduct.image });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-sm text-gray-400">Manage your product stock, badges, prices, and catalog.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showAddForm && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">List New Product</h2>
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
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required 
                  />
                  <Input 
                    label="Compare Price (₹)" 
                    type="number" 
                    placeholder="1999" 
                    value={newProduct.comparePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, comparePrice: e.target.value })}
                  />
                </div>
                <Input 
                  label="Discount Badge Text" 
                  placeholder="e.g. 20% OFF" 
                  value={newProduct.discountBadge}
                  onChange={(e) => setNewProduct({ ...newProduct, discountBadge: e.target.value })}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <ImageDropzone 
                  value={newProduct.image}
                  onChange={(url) => setNewProduct({ ...newProduct, image: url })}
                />
              </div>

            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-vybe-glassBorder">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Publish Product</Button>
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
                <th className="px-6 py-4">Selling Price (₹)</th>
                <th className="px-6 py-4">Original Price (₹)</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Label / Discount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3 min-w-[250px]">
                    <div className="w-12 h-12 rounded overflow-hidden bg-vybe-dark shrink-0 border border-vybe-glassBorder">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="line-clamp-1 font-semibold">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">ID: {product.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                      className="w-20 bg-transparent border-b border-gray-600 focus:border-vybe-neon focus:outline-none text-white pb-1"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={product.comparePrice || ''}
                      placeholder="N/A"
                      onChange={(e) => updateProduct(product.id, { comparePrice: Number(e.target.value) })}
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
                      value={product.discountBadge || ''}
                      onChange={(e) => updateProduct(product.id, { discountBadge: e.target.value })}
                      placeholder="No Badge"
                      className="bg-vybe-dark border border-transparent hover:border-vybe-glassBorder rounded px-2 py-1 text-sm w-24 focus:outline-none focus:border-vybe-neon text-white transition-colors"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" title="Delete Product">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
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
    </div>
  );
}
