import { useState, useEffect } from 'react';
import { usePrintSettingsStore } from '../../store/usePrintSettingsStore';
import { Save, MapPin, Layers } from 'lucide-react';
import { Table, Button, Typography, Input, Checkbox, Tabs, Modal, Spin } from 'antd';
import { API_URL } from '../../config';

const { Title, Text } = Typography;

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
      const res = await fetch(`${API_URL}/templates`);
      if (res.ok) setGlobalTemplates(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (printLocations?.length > 0) {
      const catalogueLocs = catalogue?.wholesaleLocations || [];
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
    if (globalTemplates?.length > 0) {
      const catalogueTpls = catalogue?.wholesaleTemplates || [];
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

  const areasColumns = [
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Text strong style={{ color: record.isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{text}</Text>},
    {
      title: 'Global Retail Price',
      key: 'retailPrice',
      render: (_, record) => {
        const globalLoc = printLocations?.find(gl => gl._id === record.locationId);
        return <Text style={{ color: record.isActive ? '#888' : 'rgba(136,136,136,0.5)' }}>₹{globalLoc?.cost || 0}</Text>;
      }},
    {
      title: 'Wholesale Price (₹)',
      key: 'wholesaleCost',
      render: (_, record) => (
        <Input 
          type="number"
          value={record.wholesaleCost}
          onChange={(e) => handleUpdateLocation(record.locationId, { wholesaleCost: Number(e.target.value) })}
          disabled={!record.isActive}
          style={{ width: '100px'}}
        />
      )},
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Checkbox 
          checked={record.isActive}
          onChange={(e) => handleUpdateLocation(record.locationId, { isActive: e.target.checked })}
        >
          <Text >{record.isActive ? 'Enabled' : 'Disabled'}</Text>
        </Checkbox>
      )},
  ];

  const templatesColumns = [
    {
      title: 'Template Name',
      key: 'name',
      render: (_, record) => {
        const globalTpl = globalTemplates?.find(gt => gt._id === record.templateId);
        return (
          <div>
            <Text strong style={{ color: record.isActive ? '#fff' : 'rgba(255,255,255,0.5)', display: 'block' }}>{record.name}</Text>
            {globalTpl?.printAreas && (
              <Text style={{ fontSize: '10px', color: record.isActive ? '#888' : 'rgba(136,136,136,0.5)' }}>
                {globalTpl.printAreas.map(pa => pa.name).join(', ')}
              </Text>
            )}
          </div>
        );
      }},
    {
      title: 'Global Retail Price',
      key: 'retailPrice',
      render: (_, record) => {
        const globalTpl = globalTemplates?.find(gt => gt._id === record.templateId);
        return <Text style={{ color: record.isActive ? '#888' : 'rgba(136,136,136,0.5)' }}>₹{globalTpl?.price || 0}</Text>;
      }},
    {
      title: 'Wholesale Price (₹)',
      key: 'wholesalePrice',
      render: (_, record) => (
        <Input 
          type="number"
          value={record.wholesalePrice}
          onChange={(e) => handleUpdateTemplate(record.templateId, { wholesalePrice: Number(e.target.value) })}
          disabled={!record.isActive}
          style={{ width: '100px'}}
        />
      )},
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Checkbox 
          checked={record.isActive}
          onChange={(e) => handleUpdateTemplate(record.templateId, { isActive: e.target.checked })}
        >
          <Text >{record.isActive ? 'Enabled' : 'Disabled'}</Text>
        </Checkbox>
      )},
  ];

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} style={{ backgroundColor: 'transparent'}}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave} icon={<Save size={16} />} style={{ fontWeight: 600, color: '#000' }}>
          Save Settings to Catalogue
        </Button>,
      ]}
      width={900}
      title={
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Wholesale Print Management</Title>
          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 'normal' }}>Set wholesale-specific pricing for global print areas and templates.</Text>
        </div>
      }
      styles={{ 
        body: { maxHeight: '70vh', overflowY: 'auto' },
        content: { },
        header: {  borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '16px' }}}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'areas',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Print Areas
              </span>
            ),
            children: (
              <Table 
                columns={areasColumns} 
                dataSource={localLocations} 
                rowKey="locationId"
                pagination={false}
                style={{ marginTop: '16px' }}
                rowClassName={(record) => !record.isActive ? 'disabled-row' : ''}
              />
            )},
          {
            key: 'templates',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} /> Templates
              </span>
            ),
            children: isLoadingTemplates ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                <Spin />
              </div>
            ) : (
              <Table 
                columns={templatesColumns} 
                dataSource={localTemplates} 
                rowKey="templateId"
                pagination={false}
                style={{ marginTop: '16px' }}
                rowClassName={(record) => !record.isActive ? 'disabled-row' : ''}
              />
            )},
        ]}
      />

      <style>{`
        .disabled-row {
          opacity: 0.5;
        }
        .ant-tabs-nav::before {
          border-bottom: 1px solid #333 !important;
        }
        .ant-tabs-tab {
          color: #888 !important;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #a3ff12 !important;
        }
        .ant-tabs-ink-bar {
          background: #a3ff12 !important;
        }
      `}</style>
    </Modal>
  );
}
