import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import { API_URL } from '../config';
import { useUIStore } from '../store/useUIStore';
import { Table, Card, Input, Button, Typography, Row, Col, Select, Tag, Checkbox, Modal, Space, Empty } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

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

  const handleSubmit = async () => {
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

  const handleChange = (name, value) => {
    if (name.startsWith('autoPlaySettings.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        autoPlaySettings: {
          ...prev.autoPlaySettings,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  const filteredBanners = banners.filter((banner) => {
    return banner.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong >{text}</Text>},
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'},
    {
      title: 'Priority',
      dataIndex: 'displayPriority',
      key: 'displayPriority'},
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Marketing Banners</Title>
          <Text type="secondary">Manage homepage hero banners and promotional carousels.</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Input 
            prefix={<Search size={16}  />} 
            placeholder="Search banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '256px'}}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()} style={{ fontWeight: 600, color: '#000' }}>
            New Banner
          </Button>
        </div>
      </div>

      <Card 
        
        bodyStyle={{ padding: 0 }}
      >
        <Table 
          columns={columns} 
          dataSource={filteredBanners} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ 
            emptyText: (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Empty description="No Banners Found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Banner' : 'Create Banner'}
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
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Title</Text>
              <Input 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)} 
                
              />
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Subtitle</Text>
              <Input 
                value={formData.subtitle} 
                onChange={(e) => handleChange('subtitle', e.target.value)} 
                
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Type</Text>
              <Select 
                value={formData.type} 
                onChange={(value) => handleChange('type', value)}
                style={{ width: '100%' }}
                popupClassName="custom-select-dropdown"
              >
                <Option value="Discount Banner">Discount Banner</Option>
                <Option value="New Collection Banner">New Collection Banner</Option>
                <Option value="New Drop Banner">New Drop Banner</Option>
                <Option value="Marketing Campaign">Marketing Campaign</Option>
                <Option value="Festival Sale">Festival Sale</Option>
                <Option value="Announcement Banner">Announcement Banner</Option>
              </Select>
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Priority (Higher = first)</Text>
              <Input 
                type="number"
                value={formData.displayPriority} 
                onChange={(e) => handleChange('displayPriority', Number(e.target.value))} 
                
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>CTA Text</Text>
              <Input 
                value={formData.ctaText} 
                onChange={(e) => handleChange('ctaText', e.target.value)} 
                
              />
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>CTA URL</Text>
              <Input 
                value={formData.ctaUrl} 
                onChange={(e) => handleChange('ctaUrl', e.target.value)} 
                
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Desktop Image</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input 
                  value={formData.desktopImage} 
                  onChange={(e) => handleChange('desktopImage', e.target.value)} 
                  placeholder="https://..."
                  
                />
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', backgroundColor: '#333', borderRadius: '8px', cursor: 'pointer' }}>
                  <ImageIcon size={16} color="#fff" />
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'desktopImage')} />
                </label>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text style={{  display: 'block', marginBottom: '8px' }}>Mobile Image</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input 
                  value={formData.mobileImage} 
                  onChange={(e) => handleChange('mobileImage', e.target.value)} 
                  placeholder="https://..."
                  
                />
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', backgroundColor: '#333', borderRadius: '8px', cursor: 'pointer' }}>
                  <ImageIcon size={16} color="#fff" />
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'mobileImage')} />
                </label>
              </div>
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingTop: '16px', borderTop: '1px solid #333' }}>
            <Checkbox checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)}>
              <Text >Active</Text>
            </Checkbox>
            <Checkbox checked={formData.autoPlaySettings?.enabled} onChange={(e) => handleChange('autoPlaySettings.enabled', e.target.checked)}>
              <Text >AutoPlay</Text>
            </Checkbox>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent'}}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit} style={{ fontWeight: 600, color: '#000' }}>
              {editingId ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </div>
      </Modal>

      
    </div>
  );
}
