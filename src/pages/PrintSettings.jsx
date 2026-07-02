import { useState, useEffect } from 'react';
import { usePrintSettingsStore } from '../store/usePrintSettingsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { MapPin, Power, Save, Layers, Edit2, Trash2, Plus, X, Check, Star, DollarSign } from 'lucide-react';
import { API_URL } from '../config';
import { useUIStore } from '../store/useUIStore';
import { Card, Table, Button, Typography, Input, Checkbox, Tabs, Modal, Spin, Tag, Row, Col, Space, Empty } from 'antd';
import PrintAreaSelector from '../components/custom-print/PrintAreaSelector';

const { Title, Text } = Typography;

export default function PrintSettings() {
  const { printLocations, fetchPrintLocations, addLocation, deleteLocation, loading } = usePrintSettingsStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('areas');
  const { alert, confirm } = useUIStore();

  const [localLocations, setLocalLocations] = useState([]);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState({ name: '', cost: 0, isActive: true, boundingBox: { top: 30, left: 40, width: 20, height: 20 } });
  const [localBasePrice, setLocalBasePrice] = useState(0);

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
    fetchSettings();
  }, [fetchPrintLocations, fetchSettings]);

  useEffect(() => {
    if (printLocations) {
      setLocalLocations(JSON.parse(JSON.stringify(printLocations)));
    }
  }, [printLocations]);

  useEffect(() => {
    if (settings && settings.general) {
      setLocalBasePrice(settings.general.plainTshirtBasePrice || 0);
    }
  }, [settings]);

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

  const handleToggleArea = async (id, currentStatus) => {
    await usePrintSettingsStore.getState().updateLocation(id, { isActive: !currentStatus });
    fetchPrintLocations();
  };

  const openAreaModal = (area = null) => {
    if (area) {
      setCurrentArea(area);
    } else {
      setCurrentArea({ name: '', cost: 0, isActive: true, boundingBox: { top: 30, left: 40, width: 20, height: 20 } });
    }
    setIsAreaModalOpen(true);
  };

  const handleSaveAreaModal = async () => {
    if (!currentArea.name.trim()) return alert('Please enter a zone name.', 'error', 'Error');
    if (currentArea._id) {
      await usePrintSettingsStore.getState().updateLocation(currentArea._id, currentArea);
      alert('Print area updated successfully.', 'success', 'Updated');
    } else {
      const success = await usePrintSettingsStore.getState().addLocation(currentArea);
      if (success) {
        alert('Print area added successfully.', 'success', 'Added');
      } else {
        alert('Failed to add print area.', 'error', 'Error');
      }
    }
    setIsAreaModalOpen(false);
    fetchPrintLocations();
  };

  const handleDeleteArea = (id) => {
    confirm({
      title: 'Delete Print Area',
      message: 'Are you sure you want to delete this print area? This might break templates using it.',
      confirmText: 'Delete',
      onConfirm: async () => {
        await usePrintSettingsStore.getState().deleteLocation(id);
        fetchPrintLocations();
      }
    });
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
        alert(`Failed to save template: ${errorData.message || res.statusText}`, 'error', 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving template.', 'error', 'Error');
    }
  };

  const handleDeleteTemplate = (id) => {
    confirm({
      title: 'Delete Template',
      message: 'Are you sure you want to delete this template?',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await fetch(`${API_URL}/templates/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchTemplates();
        } catch (err) {
          console.error(err);
        }
      }
    });
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

  // --- Colors Logic ---
  const [newColor, setNewColor] = useState({ name: '', hex: '#ffffff' });

  const handleAddColor = async () => {
    if (!newColor.name || !newColor.hex) return;
    const updatedColors = [...(settings?.customPrintColors || []), { ...newColor, isActive: true }];
    const success = await updateSettings({ customPrintColors: updatedColors });
    if (success) {
      setNewColor({ name: '', hex: '#ffffff' });
      alert('Color added successfully.', 'success', 'Added');
    } else {
      alert('Failed to add color.', 'error', 'Error');
    }
  };

  const handleRemoveColor = async (index) => {
    const updatedColors = [...(settings?.customPrintColors || [])];
    updatedColors.splice(index, 1);
    const success = await updateSettings({ customPrintColors: updatedColors });
    if (success) alert('Color removed.', 'success', 'Removed');
  };

  const areasColumns = [
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Price (₹)',
      dataIndex: 'cost',
      key: 'cost',
      render: (text) => <Text>₹{text}</Text>
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? 'Active' : 'Disabled'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit2 size={16} />}
            onClick={() => openAreaModal(record)}
            style={{ color: '#a3ff12' }}
          />
          <Button
            type="text"
            icon={<Power size={16} />}
            onClick={() => handleToggleArea(record._id, record.isActive)}
            style={{ color: record.isActive ? '#faad14' : '#52c41a' }}
            title={record.isActive ? 'Disable Location' : 'Enable Location'}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => handleDeleteArea(record._id)}
          />
        </Space>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>Print Management</Title>
          <Text type="secondary">Configure print zones, pricing, and preset templates.</Text>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'base',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} /> Base Settings
              </span>
            ),
            children: (
              <div style={{ marginTop: '16px' }}>
                <Card>
                  <Title level={5} style={{ marginBottom: '16px' }}>Plain T-Shirt Base Price</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                    Set the default base price for a plain, unprinted custom T-shirt. This price will be displayed to users in the custom print section before any print areas are added.
                  </Text>
                  <Row gutter={16} align="bottom">
                    <Col xs={24} sm={12}>
                      <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Base Price (₹)</Text>
                      <Input
                        type="number"
                        prefix="₹"
                        value={localBasePrice}
                        onChange={(e) => setLocalBasePrice(Number(e.target.value))}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button type="primary" onClick={async () => {
                        const success = await updateSettings({
                          general: {
                            ...settings.general,
                            plainTshirtBasePrice: localBasePrice
                          }
                        });
                        if (success) alert('Base price saved successfully!', 'success', 'Saved');
                      }} icon={<Save size={16} />} style={{ fontWeight: 600, color: '#000' }}>
                        Save Base Price
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </div>
            )
          },
          {
            key: 'areas',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Print Areas
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>Manage Existing Areas</Title>
                  <Button type="primary" onClick={() => openAreaModal()} icon={<Plus size={16} />} style={{ fontWeight: 600, color: '#000' }}>
                    Add Print Area
                  </Button>
                </div>

                <Card bodyStyle={{ padding: 0 }} >
                  <Table
                    columns={areasColumns}
                    dataSource={localLocations}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                    locale={{
                      emptyText: (
                        <div style={{ padding: '48px 0', textAlign: 'center' }}>
                          <Empty description="No Print Areas Configured" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                      )
                    }}
                  />
                </Card>
              </div>
            )
          },
          {
            key: 'templates',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} /> Templates
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
                {!isEditingTemplate ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="primary" onClick={() => {
                        setCurrentTemplate({ name: '', description: '', price: 0, printAreas: [], isActive: true, isRecommended: false, isPopular: false });
                        setIsEditingTemplate(true);
                      }} icon={<Plus size={16} />} style={{ fontWeight: 600, color: '#000' }}>
                        New Template
                      </Button>
                    </div>

                    {isLoadingTemplates ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                        <Spin />
                      </div>
                    ) : (
                      <Row gutter={[24, 24]}>
                        {templates.length === 0 ? (
                          <Col span={24}>
                            <div style={{ padding: '48px 0', textAlign: 'center' }}>
                              <Empty description="No Templates Found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                          </Col>
                        ) : (
                          templates.map(template => (
                            <Col xs={24} md={12} key={template._id}>
                              <Card
                                style={{ position: 'relative' }}
                                hoverable
                                bodyStyle={{ padding: '24px' }}
                              >
                                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                  <Button type="text" icon={<Edit2 size={16} />} onClick={() => { setCurrentTemplate(template); setIsEditingTemplate(true); }} style={{ color: '#a3ff12' }} />
                                  <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => handleDeleteTemplate(template._id)} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                  <Title level={5} style={{ margin: 0 }}>{template.name}</Title>
                                  {!template.isActive && <Tag color="error">Inactive</Tag>}
                                </div>
                                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>{template.description || 'No description'}</Text>

                                <Space style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
                                  <Tag color="default" >Price: ₹{template.price}</Tag>
                                  {template.isRecommended && <Tag color="lime" icon={<Star size={12} />}>Recommended</Tag>}
                                  {template.isPopular && <Tag color="orange" icon={<Star size={12} />}>Popular</Tag>}
                                </Space>

                                <div>
                                  <Text style={{ fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Included Areas</Text>
                                  <Space wrap>
                                    {template.printAreas.map(p => (
                                      <Tag key={p.name} color="default" style={{ margin: 0 }}>{p.name}</Tag>
                                    ))}
                                  </Space>
                                </div>
                              </Card>
                            </Col>
                          ))
                        )}
                      </Row>
                    )}
                  </>
                ) : (
                  <Card >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
                      <Title level={4} style={{ margin: 0 }}>{currentTemplate._id ? 'Edit Template' : 'Create Template'}</Title>
                      <Button type="text" icon={<X size={20} />} onClick={() => setIsEditingTemplate(false)} />
                    </div>

                    <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                      <Col xs={24} md={12}>
                        <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Template Name</Text>
                        <Input
                          value={currentTemplate.name}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                          placeholder="e.g. Streetwear Combo"

                        />
                      </Col>
                      <Col xs={24} md={12}>
                        <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Template Override Price (₹)</Text>
                        <Input
                          type="number"
                          value={currentTemplate.price}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, price: Number(e.target.value) })}

                        />
                      </Col>
                      <Col span={24}>
                        <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Description</Text>
                        <Input
                          value={currentTemplate.description}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                          placeholder="e.g. Chest Design + Large Back"

                        />
                      </Col>
                    </Row>

                    <div style={{ marginBottom: '32px' }}>
                      <Text style={{ display: 'block', marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase' }}>Select Included Print Areas</Text>
                      <Space wrap>
                        {printLocations.map(area => {
                          const isSelected = currentTemplate.printAreas.some(p => p.name === area.name);
                          return (
                            <Button
                              key={area._id}
                              onClick={() => togglePrintAreaInTemplate(area.name)}
                              style={{
                                backgroundColor: isSelected ? 'rgba(163, 255, 18, 0.1)' : '#1a1a1a',
                                borderColor: isSelected ? '#a3ff12' : '#333',
                                color: isSelected ? '#a3ff12' : '#fff'
                              }}
                              icon={isSelected && <Check size={14} />}
                            >
                              {area.name}
                            </Button>
                          );
                        })}
                      </Space>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderTop: '1px solid #333', paddingTop: '24px' }}>
                      <Checkbox
                        checked={currentTemplate.isActive}
                        onChange={e => setCurrentTemplate({ ...currentTemplate, isActive: e.target.checked })}
                      >
                        <Text >Active (Visible to users)</Text>
                      </Checkbox>
                      <Checkbox
                        checked={currentTemplate.isRecommended}
                        onChange={e => setCurrentTemplate({ ...currentTemplate, isRecommended: e.target.checked })}
                      >
                        <Text >Mark as Recommended</Text>
                      </Checkbox>
                      <Checkbox
                        checked={currentTemplate.isPopular}
                        onChange={e => setCurrentTemplate({ ...currentTemplate, isPopular: e.target.checked })}
                      >
                        <Text >Mark as Popular</Text>
                      </Checkbox>
                    </div>

                    <div style={{ display: 'flex', justifyItems: 'flex-end', gap: '12px' }}>
                      <Button onClick={() => setIsEditingTemplate(false)} style={{ backgroundColor: 'transparent' }}>Cancel</Button>
                      <Button type="primary" onClick={handleSaveTemplate} icon={<Save size={16} />} style={{ fontWeight: 600, color: '#000' }}>Save Template</Button>
                    </div>
                  </Card>
                )}
              </div>
            )
          },
          {
            key: 'colors',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} /> Colors
              </span>
            ),
            children: (
              <div style={{ marginTop: '16px' }}>
                <Card >
                  <Title level={5} style={{ marginBottom: '24px' }}>Available T-Shirt Colors</Title>

                  <Row gutter={16} align="bottom" style={{ marginBottom: '32px', borderBottom: '1px solid #333', paddingBottom: '32px' }}>
                    <Col xs={24} sm={12}>
                      <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Color Name</Text>
                      <Input
                        value={newColor.name}
                        onChange={e => setNewColor({ ...newColor, name: e.target.value })}
                        placeholder="e.g. Vintage Black"

                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Hex Value</Text>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="color"
                          value={newColor.hex}
                          onChange={e => setNewColor({ ...newColor, hex: e.target.value })}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
                        />
                        <Input
                          value={newColor.hex}
                          onChange={e => setNewColor({ ...newColor, hex: e.target.value })}
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Button type="primary" onClick={handleAddColor} icon={<Plus size={16} />} style={{ width: '100%', fontWeight: 600, color: '#000' }}>
                        Add Color
                      </Button>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    {(settings?.customPrintColors || []).map((color, idx) => (
                      <Col xs={12} sm={8} md={6} lg={4} key={idx}>
                        <div style={{

                          border: '1px solid #333',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Button
                            type="text"
                            danger
                            icon={<X size={12} />}
                            onClick={() => handleRemoveColor(idx)}
                            style={{ position: 'absolute', top: 4, right: 4, padding: 4, width: '24px', height: '24px' }}
                          />
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: color.hex,
                            border: '1px solid rgba(255,255,255,0.2)',
                            marginBottom: '12px'
                          }} />
                          <Text strong style={{ textAlign: 'center', width: '100%' }} ellipsis>{color.name}</Text>
                          <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{color.hex}</Text>
                        </div>
                      </Col>
                    ))}
                    {(!settings?.customPrintColors || settings.customPrintColors.length === 0) && (
                      <Col span={24}>
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                          <Empty description="No Colors Published Yet. Add one above." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </div>
            )
          },
        ]}
      />

      <Modal
        title={currentArea._id ? "Edit Print Area" : "Add Print Area"}
        open={isAreaModalOpen}
        onCancel={() => setIsAreaModalOpen(false)}
        onOk={handleSaveAreaModal}
        okText="Save Area"
        centered
        width={600}
        styles={{ content: { border: '1px solid #333' } }}
        okButtonProps={{ type: 'primary', style: { color: '#000', fontWeight: 600 } }}
        cancelButtonProps={{ style: { backgroundColor: 'transparent' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' }}>
          <Row gutter={16}>
            <Col span={16}>
              <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Zone Name</Text>
              <Input
                value={currentArea.name}
                onChange={e => setCurrentArea({ ...currentArea, name: e.target.value })}
                placeholder="e.g. Center Chest"
              />
            </Col>
            <Col span={8}>
              <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Price (₹)</Text>
              <Input
                type="number"
                value={currentArea.cost}
                onChange={e => setCurrentArea({ ...currentArea, cost: Number(e.target.value) })}
              />
            </Col>
          </Row>

          <Checkbox
            checked={currentArea.isActive}
            onChange={e => setCurrentArea({ ...currentArea, isActive: e.target.checked })}
          >
            <Text>Active (Visible to users)</Text>
          </Checkbox>

          <PrintAreaSelector
            value={currentArea.boundingBox}
            onChange={(boundingBox) => setCurrentArea({ ...currentArea, boundingBox })}
          />
        </div>
      </Modal>

    </div>
  );
}
