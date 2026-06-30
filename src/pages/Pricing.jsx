import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Edit2 } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { API_URL } from '../config';
import { Card, Input, Button, Typography, Row, Col, Select, Spin, Empty, Modal, Form } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Pricing() {
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  
  const { alert, confirm } = useUIStore();
  const token = localStorage.getItem('vybe-admin-token');
  const [form] = Form.useForm();

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

  const openAddModal = () => {
    setCurrentRule(null);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      value: 0,
      currency: 'INR',
      type: 'fixed',
      action: 'add',
      minSubtotal: 0,
      description: ''
    });
    setIsModalVisible(true);
  };

  const openEditModal = (rule) => {
    setCurrentRule(rule);
    form.setFieldsValue(rule);
    setIsModalVisible(true);
  };

  const handleModalSave = async (values) => {
    setSaving(true);
    
    // Ensure numeric fields are cast to numbers
    const payload = {
      ...values,
      value: Number(values.value) || 0,
      minSubtotal: Number(values.minSubtotal) || 0,
      currency: 'INR'
    };

    try {
      if (currentRule && currentRule._id) {
        // Editing existing rule
        await fetch(`${API_URL}/pricing/${currentRule._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Creating new rule
        const res = await fetch(`${API_URL}/pricing`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        const savedData = await res.json();
        
        // WORKAROUND: The remote backend ignores 'action' and 'minSubtotal' in POST.
        // We immediately do a PUT to update the missing fields.
        if (savedData && savedData._id) {
          await fetch(`${API_URL}/pricing/${savedData._id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ ...savedData, ...payload })
          });
        }
      }
      
      alert(`Pricing configuration ${currentRule ? 'updated' : 'added'} successfully!`, 'success', 'Success');
      setIsModalVisible(false);
      fetchPricing();
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing configuration.', 'error', 'Error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    confirm({
      title: 'Delete Pricing Config',
      message: 'Are you sure you want to delete this pricing configuration?',
      confirmText: 'Delete',
      onConfirm: async () => {
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
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{  margin: 0, marginBottom: '8px' }}>Discounts & Charges</Title>
          <Text type="secondary">Manage base fees, delivery charges, and dynamic discount templates.</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={openAddModal} style={{ fontWeight: 600, color: '#000' }}>
          Add Rule
        </Button>
      </div>

      <Card bodyStyle={{ padding: 0 }}>
        {pricingConfigs.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">No pricing configurations found. Add one to get started.</Text>}
            style={{ padding: '48px 0' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pricingConfigs.map((config, index) => (
              <div 
                key={config._id || index} 
                style={{ 
                  padding: '24px', 
                  borderBottom: index !== pricingConfigs.length - 1 ? '1px solid #333' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>{config.name}</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>{config.description || 'No description provided.'}</Text>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Text strong>
                      {config.action === 'subtract' ? 'Discount: ' : 'Additional Charge: '}
                      {config.type === 'percentage' ? `${config.value}%` : `₹${config.value}`}
                    </Text>
                    {config.minSubtotal > 0 && (
                      <Text type="secondary">Min. Order: ₹{config.minSubtotal}</Text>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    type="text" 
                    icon={<Edit2 size={16} />} 
                    onClick={() => openEditModal(config)}
                    title="Edit Rule"
                  />
                  <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 size={16} />} 
                    onClick={() => handleDelete(config._id)}
                    title="Delete Rule"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>{currentRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</Title>}
        open={isModalVisible}
        onCancel={() => !saving && setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)} disabled={saving} style={{ backgroundColor: 'transparent' }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()} loading={saving} style={{ fontWeight: 600, color: '#000' }}>
            Save Rule
          </Button>,
        ]}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleModalSave} style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Fee Name" rules={[{ required: true, message: 'Please enter fee name' }]}>
                <Input placeholder="e.g., Delivery Fee" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Value" rules={[{ required: true, message: 'Please enter value' }]}>
                <Input type="number" prefix={<DollarSign size={14} color="#888" />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Format">
                <Select popupClassName="custom-select-dropdown">
                  <Option value="fixed">Fixed Amount</Option>
                  <Option value="percentage">Percentage (%)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="action" label="Type">
                <Select popupClassName="custom-select-dropdown">
                  <Option value="add">Additional Charge (+)</Option>
                  <Option value="subtract">Discount (-)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minSubtotal" label="Min. Order Amount (INR)">
                <Input type="number" placeholder="e.g. 50000 (leave empty for no limit)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="Description (Optional)">
                <Input placeholder="Explain when this rule applies..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
