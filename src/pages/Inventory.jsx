import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useUIStore } from '../store/useUIStore';
import ImageDropzone from '../components/common/ImageDropzone';
import { Package, Trash2, Plus, Edit2, X, Search } from 'lucide-react';
import { Table, Card, Button, Input, Checkbox, Row, Col, Typography, Tag, Space, Empty } from 'antd';

const { Title, Text } = Typography;

const EditablePriceInput = ({ product, updateProduct }) => {
  const [val, setVal] = useState(product.price || '');
  useEffect(() => setVal(product.price || ''), [product.price]);
  const handleBlur = () => {
    const newPrice = Number(val);
    if (newPrice === product.price) return;
    const updates = { price: newPrice };
    if (product.comparePrice && newPrice < product.comparePrice) {
      updates.discountBadge = Math.round(((product.comparePrice - newPrice) / product.comparePrice) * 100) + '% OFF';
    }
    updateProduct(product.id, updates);
  };
  return (
    <input type="number" value={val} onChange={(e) => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none' }} />
  );
};

const EditableComparePriceInput = ({ product, updateProduct }) => {
  const [val, setVal] = useState(product.comparePrice || '');
  useEffect(() => setVal(product.comparePrice || ''), [product.comparePrice]);
  const handleBlur = () => {
    const newComparePrice = Number(val);
    if (newComparePrice === product.comparePrice) return;
    const updates = { comparePrice: newComparePrice };
    if (newComparePrice && product.price && product.price < newComparePrice) {
      updates.discountBadge = Math.round(((newComparePrice - product.price) / newComparePrice) * 100) + '% OFF';
    }
    updateProduct(product.id, updates);
  };
  return (
    <input type="number" value={val} placeholder="N/A" onChange={(e) => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none' }} />
  );
};

const EditableDiscountInput = ({ product, updateProduct }) => {
  const [val, setVal] = useState(product.discountBadge ? String(product.discountBadge).replace(/[^0-9]/g, '') : '');
  useEffect(() => setVal(product.discountBadge ? String(product.discountBadge).replace(/[^0-9]/g, '') : ''), [product.discountBadge]);
  const handleBlur = () => {
    const newDiscountStr = val.replace(/[^0-9]/g, '');
    const currentDiscountStr = product.discountBadge ? String(product.discountBadge).replace(/[^0-9]/g, '') : '';
    if (newDiscountStr === currentDiscountStr) return;
    const newDiscount = Number(newDiscountStr);
    const updates = { discountBadge: newDiscountStr ? `${newDiscountStr}% OFF` : '' };
    if (product.comparePrice && newDiscountStr) {
      updates.price = Math.round(product.comparePrice * (1 - newDiscount / 100));
    }
    updateProduct(product.id, updates);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Input value={val} onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ''))} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} placeholder="%" style={{ width: 64 }} />
      <span style={{ fontSize: 12 }}>%</span>
    </div>
  );
};

export default function Inventory() {
  const { 
    products, 
    addProduct, 
    deleteProduct,
    updateProduct,
    toggleStock,
    fetchProducts,
    isLoading
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

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    return product.name?.toLowerCase().includes(query) || product.id?.toLowerCase().includes(query);
  });

  const columns = [
    {
      title: 'Product Info',
      dataIndex: 'info',
      key: 'info',
      width: 280,
      render: (_, product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 4, overflow: 'hidden', border: '1px solid #333', flexShrink: 0 }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600,  display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</div>
            <div style={{ fontSize: 12,  margin: '2px 0 4px' }}>ID: {product.id}</div>
            <Checkbox 
              checked={product.allowCustomPrint}
              onChange={(e) => updateProduct(product.id, { allowCustomPrint: e.target.checked })}
              style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1}}
            >
              Custom Prints
            </Checkbox>
          </div>
        </div>
      )
    },
    {
      title: 'Sizes & Colors',
      key: 'variants',
      width: 200,
      render: (_, product) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {product.sizes && product.sizes.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {product.sizes.map(size => {
                const isOOS = product.outOfStockSizes?.includes(size);
                return (
                  <Tag 
                    key={size} 
                    color={isOOS ? 'error' : 'default'}
                    style={isOOS ? { textDecoration: 'line-through', opacity: 0.7, margin: 0 } : { backgroundColor: '#1f1f1f',  color: '#ccc', margin: 0 }}
                  >
                    {size}
                  </Tag>
                );
              })}
            </div>
          ) : (
            <span style={{ fontSize: 12}}>-</span>
          )}
          
          {product.colors && product.colors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {product.colors.map(color => {
                const isOOS = product.outOfStockColors?.includes(color);
                return (
                  <div key={color} style={{ position: 'relative' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color, border: '1px solid #666', opacity: isOOS ? 0.5 : 1 }} title={color + (isOOS ? ' (Out of Stock)' : '')}></div>
                    {isOOS && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 16, height: 2, backgroundColor: '#ff4d4f', transform: 'rotate(45deg)' }}></div></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Selling Price (₹)',
      key: 'price',
      width: 120,
      render: (_, product) => (
        <div style={{ paddingBottom: '4px', borderBottom: '1px solid #333' }}>
          <EditablePriceInput product={product} updateProduct={updateProduct} />
        </div>
      )
    },
    {
      title: 'Original Price (₹)',
      key: 'comparePrice',
      width: 120,
      render: (_, product) => (
        <div style={{ paddingBottom: '4px', borderBottom: '1px solid #333' }}>
          <EditableComparePriceInput product={product} updateProduct={updateProduct} />
        </div>
      )
    },
    {
      title: 'Stock Status',
      key: 'stockStatus',
      width: 120,
      render: (_, product) => (
        <Tag 
          color={product.stockStatus === 'In Stock' ? 'success' : 'error'}
          onClick={() => toggleStock(product.id)}
          style={{ cursor: 'pointer', borderRadius: '12px', padding: '2px 8px' }}
        >
          {product.stockStatus}
        </Tag>
      )
    },
    {
      title: 'Label / Discount',
      key: 'discount',
      width: 120,
      render: (_, product) => (
        <EditableDiscountInput product={product} updateProduct={updateProduct} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, product) => (
        <Space>
          <Button 
            type="text" 
            icon={<Edit2 size={16} />} 
            onClick={() => handleEditClick(product)} 
             
          />
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={16} />} 
            onClick={() => {
              confirm({
                title: 'Delete Product',
                message: `Are you sure you want to delete ${product.name}?`,
                confirmText: 'Delete',
                onConfirm: () => deleteProduct(product.id)
              });
            }} 
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Inventory Management</Title>
          <Text type="secondary">Manage your product stock, badges, prices, and catalog.</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Input 
            prefix={<Search size={16}  />} 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '256px'}}
          />
          <Button 
            type="primary" 
            icon={<Plus size={16} />} 
            style={{ fontWeight: 600, color: '#000' }}
            onClick={() => {
              setEditingId(null);
              setNewProduct(initialFormState);
              setShowAddForm(!showAddForm);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card 
          style={{   position: 'relative' }}
          bodyStyle={{ padding: '24px' }}
        >
          <Button 
            type="text" 
            icon={<X size={20} />} 
            onClick={() => setShowAddForm(false)} 
            style={{ position: 'absolute', top: 16, right: 16}} 
          />
          <Title level={5} style={{  marginTop: 0, marginBottom: '24px' }}>
            {editingId ? 'Edit Product' : 'List New Product'}
          </Title>
          
          <form onSubmit={handleAdd}>
            <Row gutter={[24, 24]}>
              {/* Left Column */}
              <Col xs={24} md={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Product Name</label>
                    <Input 
                      placeholder="e.g. Graphic Tee" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required 
                      
                    />
                  </div>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Selling Price (₹)</label>
                      <Input 
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
                    </Col>
                    <Col span={12}>
                      <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Original Price (₹)</label>
                      <Input 
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
                    </Col>
                  </Row>

                  <div>
                    <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Discount (%)</label>
                    <Input 
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
                  </div>

                  <div>
                    <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Available Sizes</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['S', 'M', 'L', 'XL'].map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeToggle(size)}
                            style={{
                              width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, cursor: 'pointer', border: '1px solid',
                              backgroundColor: newProduct.sizes?.includes(size) ? '#a3ff12' : '#1a1a1a',
                              color: newProduct.sizes?.includes(size) ? '#000' : '#888',
                              borderColor: newProduct.sizes?.includes(size) ? '#a3ff12' : '#333'
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      
                      {newProduct.sizes?.length > 0 && (
                        <div style={{ padding: '12px',  borderRadius: '8px', border: '1px solid #333' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500,  marginBottom: '8px' }}>Mark specific sizes as Out of Stock:</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {newProduct.sizes.map(size => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleStockToggle('outOfStockSizes', size)}
                                style={{
                                  padding: '4px 8px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', border: '1px solid',
                                  backgroundColor: newProduct.outOfStockSizes?.includes(size) ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                  color: newProduct.outOfStockSizes?.includes(size) ? '#f87171' : '#888',
                                  borderColor: newProduct.outOfStockSizes?.includes(size) ? 'rgba(239, 68, 68, 0.5)' : '#333'
                                }}
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
                    <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Available Colors</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="color" 
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer', padding: 0, border: 0, backgroundColor: 'transparent' }}
                      />
                      <Button type="default" onClick={handleAddColor} style={{ backgroundColor: 'transparent'}}>Add Color</Button>
                    </div>
                    
                    {newProduct.colors?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {newProduct.colors.map(color => (
                            <div key={color} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleRemoveColor(color)} title="Click to remove">
                              <div style={{ width: '24px', height: '24px', borderRadius: '4px', border: newProduct.outOfStockColors?.includes(color) ? '1px solid #ef4444' : '1px solid #4b5563', backgroundColor: color, opacity: newProduct.outOfStockColors?.includes(color) ? 0.5 : 1 }}></div>
                              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: '4px', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                                <Trash2 size={12} color="#fff" />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ padding: '12px',  borderRadius: '8px', border: '1px solid #333' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500,  marginBottom: '8px' }}>Mark specific colors as Out of Stock:</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {newProduct.colors.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => handleStockToggle('outOfStockColors', color)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', border: '1px solid',
                                  backgroundColor: newProduct.outOfStockColors?.includes(color) ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                  color: newProduct.outOfStockColors?.includes(color) ? '#f87171' : '#888',
                                  borderColor: newProduct.outOfStockColors?.includes(color) ? 'rgba(239, 68, 68, 0.5)' : '#333'
                                }}
                              >
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #4b5563', backgroundColor: color }}></div>
                                {newProduct.outOfStockColors?.includes(color) ? 'OOS' : 'In Stock'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {/* Right Column */}
              <Col xs={24} md={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Display Picture (Main)</label>
                    <ImageDropzone 
                      value={newProduct.image}
                      onChange={(url) => setNewProduct({ ...newProduct, image: url })}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block',  marginBottom: '8px', fontSize: '14px' }}>Extra Images</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {newProduct.images.map((img, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Input 
                            placeholder="Image URL" 
                            value={img} 
                            onChange={(e) => {
                              const newImages = [...newProduct.images];
                              newImages[idx] = e.target.value;
                              setNewProduct({ ...newProduct, images: newImages });
                            }} 
                            
                          />
                          <Button 
                            danger 
                            type="text" 
                            icon={<Trash2 size={16} />} 
                            onClick={() => {
                              const newImages = newProduct.images.filter((_, i) => i !== idx);
                              setNewProduct({ ...newProduct, images: newImages });
                            }} 
                          />
                        </div>
                      ))}
                      <Button 
                        type="dashed" 
                        icon={<Plus size={16} />} 
                        onClick={() => setNewProduct({ ...newProduct, images: [...newProduct.images, ''] })}
                        style={{ backgroundColor: 'transparent',   alignSelf: 'flex-start' }}
                      >
                        Add Extra Image
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',  padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                      <Checkbox 
                        checked={newProduct.allowCustomPrint}
                        onChange={(e) => setNewProduct({ ...newProduct, allowCustomPrint: e.target.checked })}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500}}>Allow Custom Prints on this Product</span>
                    </label>
                    <p style={{ fontSize: '12px',  marginTop: '4px', paddingLeft: '4px' }}>If checked, users will see the "Want Custom Prints?" button for this product.</p>
                  </div>
                  
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'block',  fontSize: '14px' }}>Display Tags</label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',  padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                      <Checkbox checked={newProduct.isBestSeller} onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })} />
                      <span style={{ fontSize: '14px', fontWeight: 500}}>Best Seller</span>
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',  padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                      <Checkbox checked={newProduct.isRecommended} onChange={(e) => setNewProduct({ ...newProduct, isRecommended: e.target.checked })} />
                      <span style={{ fontSize: '14px', fontWeight: 500}}>Recommended</span>
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',  padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                      <Checkbox checked={newProduct.isNewArrival} onChange={(e) => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })} />
                      <span style={{ fontSize: '14px', fontWeight: 500}}>New Arrival</span>
                    </label>
                  </div>
                </div>
              </Col>
            </Row>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #333' }}>
              <Button type="default" onClick={() => setShowAddForm(false)} style={{ backgroundColor: 'transparent'}}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ fontWeight: 600, color: '#000' }}>
                {editingId ? 'Save Changes' : 'Publish Product'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card 
        
        bodyStyle={{ padding: 0 }}
      >
        <Table 
          columns={columns} 
          dataSource={filteredProducts} 
          rowKey="id"
          pagination={false}
          loading={isLoading}
          locale={{ 
            emptyText: (
              <Empty 
                image={<Package style={{ fontSize: 48,  margin: '0 auto', opacity: 0.5 }} />}
                description={
                  <div>
                    <div style={{  fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Inventory is Empty</div>
                    <div style={{  fontSize: 14 }}>You haven't added any products to your store yet.</div>
                  </div>
                }
              >
                <Button type="primary" icon={<Plus size={16} />} onClick={() => setShowAddForm(true)} style={{ color: '#000', fontWeight: 600, marginTop: 16 }}>
                  Add Your First Product
                </Button>
              </Empty>
            )
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
