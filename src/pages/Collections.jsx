import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import { API_URL } from '../config';
import { useUIStore } from '../store/useUIStore';
import { Table, Card, Input, Button, Typography, Row, Col, Select, Tag, Checkbox, Modal, Space, Empty } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
  const { alert, confirm } = useUIStore();

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

  const handleSubmit = async () => {
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
        alert(data.message || 'Error saving collection', 'error', 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error', 'error', 'Error');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Collection',
      message: 'Are you sure you want to delete this collection?',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/collections/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            fetchCollections();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!', 'error', 'Invalid File');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds the 3MB limit. Please choose a smaller image.', 'error', 'File Too Large');
      return;
    }

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

  const filteredCollections = collections.filter((col) => {
    return col.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong >{text}</Text>},
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'},
    {
      title: 'Products',
      key: 'products',
      render: (_, record) => `${record.products?.length || 0} items`},
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      )},
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<Edit2 size={16} />} 
            onClick={() => handleOpenModal(record)} 
            style={{ color: '#a3ff12' }}
          />
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={16} />} 
            onClick={() => handleDelete(record._id)} 
          />
        </Space>
      )},
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Collections & Drops</Title>
          <Text type="secondary">Manage your product collections, drops, and campaigns.</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Input 
            prefix={<Search size={16}  />} 
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '256px'}}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()} style={{ fontWeight: 600, color: '#000' }}>
            New Collection
          </Button>
        </div>
      </div>

      <Card 
        
        bodyStyle={{ padding: 0 }}
      >
        <Table 
          columns={columns} 
          dataSource={filteredCollections} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ 
            emptyText: (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Empty description="No Collections Found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Collection' : 'Create Collection'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        styles={{ 
          body: { maxHeight: '80vh', overflowY: 'auto', paddingRight: '8px' },
          content: { },
          header: {  borderBottom: '1px solid #333' }}}
        closeIcon={<X size={20} color="#888" />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div>
            <Text style={{  display: 'block', marginBottom: '8px' }}>Name</Text>
            <Input 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              
            />
          </div>

          <div>
            <Text style={{  display: 'block', marginBottom: '8px' }}>Description</Text>
            <TextArea 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              rows={4}
              
            />
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Type</Text>
              <Select 
                value={formData.type} 
                onChange={(value) => handleChange('type', value)}
                style={{ width: '100%' }}
                popupClassName="custom-select-dropdown"
              >
                <Option value="Regular Collection">Regular Collection</Option>
                <Option value="New Drop">New Drop</Option>
                <Option value="Limited Edition">Limited Edition</Option>
                <Option value="Seasonal Collection">Seasonal Collection</Option>
              </Select>
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Display Order</Text>
              <Input 
                type="number"
                value={formData.displayOrder} 
                onChange={(e) => handleChange('displayOrder', Number(e.target.value))} 
                
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Start Date (Optional)</Text>
              <Input 
                type="datetime-local"
                value={formData.startDate} 
                onChange={(e) => handleChange('startDate', e.target.value)} 
                
              />
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>End Date (Optional)</Text>
              <Input 
                type="datetime-local"
                value={formData.endDate} 
                onChange={(e) => handleChange('endDate', e.target.value)} 
                
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Banner Image</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input 
                  value={formData.bannerImage} 
                  onChange={(e) => handleChange('bannerImage', e.target.value)} 
                  placeholder="https://..."
                  
                />
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', backgroundColor: '#333', borderRadius: '8px', cursor: 'pointer' }}>
                  <ImageIcon size={16} color="#fff" />
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'bannerImage')} />
                </label>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Cover Image</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input 
                  value={formData.coverImage} 
                  onChange={(e) => handleChange('coverImage', e.target.value)} 
                  placeholder="https://..."
                  
                />
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', backgroundColor: '#333', borderRadius: '8px', cursor: 'pointer' }}>
                  <ImageIcon size={16} color="#fff" />
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'coverImage')} />
                </label>
              </div>
            </Col>
          </Row>

          <div>
            <Text style={{  display: 'block', marginBottom: '8px' }}>Assign Products ({formData.products.length} selected)</Text>
            <div style={{  border: '1px solid #333', borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {allProducts.length === 0 ? (
                <Text type="secondary">No products available.</Text>
              ) : (
                <Row gutter={[8, 8]}>
                  {allProducts.map(product => (
                    <Col xs={24} sm={12} key={product._id}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px',  borderRadius: '4px', border: '1px solid #333', cursor: 'pointer' }}
                        onClick={() => handleProductToggle(product._id)}
                      >
                        <Checkbox 
                          checked={formData.products.includes(product._id)}
                          style={{ margin: 0 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          {product.images && product.images[0] && (
                            <img src={product.images[0]} alt="" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <Text style={{  fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{product.name}</Text>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingTop: '16px', borderTop: '1px solid #333' }}>
            <Checkbox checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)}>
              <Text >Active</Text>
            </Checkbox>
            <Checkbox checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)}>
              <Text >Featured on Homepage</Text>
            </Checkbox>
            <Checkbox checked={formData.countdownTimer} onChange={(e) => handleChange('countdownTimer', e.target.checked)}>
              <Text >Show Countdown</Text>
            </Checkbox>
            <Checkbox checked={formData.preOrderEnabled} onChange={(e) => handleChange('preOrderEnabled', e.target.checked)}>
              <Text >Enable Pre-Orders</Text>
            </Checkbox>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent'}}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit} style={{ fontWeight: 600, color: '#000' }}>
              {editingId ? 'Update Collection' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
