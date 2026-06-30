import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { Card, Button, Input, Tabs, Typography, Row, Col } from 'antd';
import { Save, Settings2, LayoutTemplate, Palette } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Settings() {
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();
  const { alert, confirm } = useUIStore();
  const [activeTab, setActiveTab] = useState('theme');
  const [formData, setFormData] = useState({
    themeColors: { primary: '#000000', secondary: '#FFFFFF', accent: '#A3FF12' },
    borderRadius: { button: '0px', popup: '0.75rem' },
    general: { storeName: 'Vybe', supportEmail: 'support@vybe.com', announcement: '' }
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    const success = await updateSettings(formData);
    if (success) {
      alert('Settings updated successfully! Changes will reflect on the client storefront immediately.', 'success', 'Saved');
    } else {
      alert('Failed to update settings.', 'error', 'Error');
    }
  };

  const handleRestoreDefaults = async () => {
    confirm({
      title: 'Restore Defaults',
      message: 'Are you sure you want to restore all settings to their default values? This will immediately apply to the storefront.',
      confirmText: 'Restore',
      onConfirm: async () => {
        const defaults = {
          themeColors: { primary: '#000000', secondary: '#FFFFFF', accent: '#A3FF12' },
          borderRadius: { button: '0px', popup: '0.75rem' },
          general: { storeName: 'Vybe', supportEmail: 'support@vybe.com', announcement: '' }
        };
        
        const success = await updateSettings(defaults);
        if (success) {
          setFormData(defaults);
          alert('Settings restored to defaults.', 'success', 'Restored');
        } else {
          alert('Failed to restore settings.', 'error', 'Error');
        }
      }
    });
  };

  if (isLoading && !settings) {
    return <div >Loading settings...</div>;
  }

  const tabItems = [
    {
      key: 'theme',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Palette size={16} /> Theme Colors</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Title level={5} style={{  margin: 0 }}>Storefront Colors</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Primary Background</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={formData.themeColors?.primary || '#000000'}
                    onChange={(e) => handleNestedChange('themeColors', 'primary', e.target.value)}
                    style={{ width: '48px', height: '48px', borderRadius: '4px', cursor: 'pointer', padding: 0, border: 0, backgroundColor: 'transparent' }}
                  />
                  <Input
                    value={formData.themeColors?.primary || '#000000'}
                    onChange={(e) => handleNestedChange('themeColors', 'primary', e.target.value)}
                    style={{    fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Secondary / Text Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={formData.themeColors?.secondary || '#FFFFFF'}
                    onChange={(e) => handleNestedChange('themeColors', 'secondary', e.target.value)}
                    style={{ width: '48px', height: '48px', borderRadius: '4px', cursor: 'pointer', padding: 0, border: 0, backgroundColor: 'transparent' }}
                  />
                  <Input
                    value={formData.themeColors?.secondary || '#FFFFFF'}
                    onChange={(e) => handleNestedChange('themeColors', 'secondary', e.target.value)}
                    style={{    fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Accent / Highlight Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={formData.themeColors?.accent || '#A3FF12'}
                    onChange={(e) => handleNestedChange('themeColors', 'accent', e.target.value)}
                    style={{ width: '48px', height: '48px', borderRadius: '4px', cursor: 'pointer', padding: 0, border: 0, backgroundColor: 'transparent' }}
                  />
                  <Input
                    value={formData.themeColors?.accent || '#A3FF12'}
                    onChange={(e) => handleNestedChange('themeColors', 'accent', e.target.value)}
                    style={{    fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'ui',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LayoutTemplate size={16} /> UI & Styling</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <Title level={5} style={{  margin: 0, marginBottom: '8px' }}>Border Radius</Title>
            <Text type="secondary">Use CSS values like 0px, 8px, 0.5rem, or 9999px (for pill shape).</Text>
          </div>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Button Border Radius</label>
                <Input
                  value={formData.borderRadius?.button || '0px'}
                  onChange={(e) => handleNestedChange('borderRadius', 'button', e.target.value)}
                  placeholder="e.g. 0px or 9999px"
                  
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Popup/Modal Border Radius</label>
                <Input
                  value={formData.borderRadius?.popup || '0.75rem'}
                  onChange={(e) => handleNestedChange('borderRadius', 'popup', e.target.value)}
                  placeholder="e.g. 1rem or 0px"
                  
                />
              </div>
            </Col>
          </Row>

          <Card  bodyStyle={{ padding: '24px' }}>
            <Title level={5} style={{  textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', marginTop: 0 }}>Live Preview</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '12px 24px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: formData.themeColors?.accent || '#A3FF12',
                  color: formData.themeColors?.primary || '#000000',
                  borderRadius: formData.borderRadius?.button || '0px'
                }}
              >
                Sample Button
              </button>
              <div 
                style={{
                  padding: '16px 24px',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: formData.themeColors?.primary || '#000000',
                  color: formData.themeColors?.secondary || '#FFFFFF',
                  borderRadius: formData.borderRadius?.popup || '0.75rem'
                }}
              >
                Sample Popup / Card
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      key: 'general',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings2 size={16} /> General Info</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Title level={5} style={{  margin: 0 }}>Store Information</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Store Name</label>
                <Input
                  value={formData.general?.storeName || ''}
                  onChange={(e) => handleNestedChange('general', 'storeName', e.target.value)}
                  
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Support Email</label>
                <Input
                  value={formData.general?.supportEmail || ''}
                  onChange={(e) => handleNestedChange('general', 'supportEmail', e.target.value)}
                  
                />
              </div>
            </Col>
            <Col xs={24}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px',  marginBottom: '8px' }}>Announcement / Notice Bar</label>
                <TextArea
                  value={formData.general?.announcement || ''}
                  onChange={(e) => handleNestedChange('general', 'announcement', e.target.value)}
                  placeholder="Enter a message. For a scrolling marquee with multiple notices, enter each on a new line."
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  
                />
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                  This will appear on all pages of the storefront. If you enter multiple lines, it will scroll like a marquee.
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '896px', paddingBottom: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Global Settings</Title>
        <Text type="secondary">Configure theme colors, border radii, and store details for the storefront.</Text>
      </div>

      <Card 
         
        bodyStyle={{ padding: '24px' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems} 
          tabBarStyle={{ marginBottom: '24px'}}
        />

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            type="link" 
            onClick={handleRestoreDefaults}
            style={{  textDecoration: 'underline', padding: 0 }}
          >
            Restore Defaults
          </Button>
          <Button type="primary" onClick={handleSave} icon={<Save size={16} />} style={{ fontWeight: 500, color: '#000' }}>
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
