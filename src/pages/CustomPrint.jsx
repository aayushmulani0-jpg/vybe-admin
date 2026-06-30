import { useState, useEffect } from 'react';
import { useCustomPrintStore } from '../store/useCustomPrintStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Palette, Eye, Download, X, Settings, Search, Save } from 'lucide-react';
import MockupViewer from '../components/custom-print/MockupViewer';
import PrintSettings from './PrintSettings';
import { Table, Card, Input, Button, Tag, Typography, Row, Col, Space, Empty, Modal } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CustomPrint() {
  const { customOrders, updateOrderStatus, fetchCustomOrders, isLoading } = useCustomPrintStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeText, setNoticeText] = useState('');

  useEffect(() => {
    fetchCustomOrders();
    fetchSettings();
  }, [fetchCustomOrders, fetchSettings]);

  useEffect(() => {
    if (settings && settings.general) {
      setNoticeText(settings.general.customPrintNotice || '');
    }
  }, [settings]);

  const handleSaveNotice = async () => {
    setIsSavingNotice(true);
    await updateSettings({
      general: {
        ...settings.general,
        customPrintNotice: noticeText
      }
    });
    setIsSavingNotice(false);
  };

  const CUSTOM_STATUSES = ['New Order', 'Printing', 'Completed'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Printing': return 'processing';
      case 'New Order': return 'warning';
      default: return 'default';
    }
  };

  const filteredOrders = customOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesId = order.id?.toLowerCase().includes(query);
    const matchesCustomer = order.customer?.toLowerCase().includes(query);
    return matchesId || matchesCustomer;
  });

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong >{text.slice(-8).toUpperCase()}</Text>},
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => text || new Date(record.createdAt).toLocaleDateString()},
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer'},
    {
      title: 'Qty',
      key: 'qty',
      render: (_, record) => record.itemsList ? record.itemsList.reduce((sum, item) => sum + item.qty, 0) : record.quantity || 1},
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => {
        const total = record.total || (record.itemsList ? record.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : (record.quantity * record.price));
        return <Text strong style={{ color: '#a3ff12' }}>₹{total.toLocaleString()}</Text>;
      }},
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<Eye size={16} />} 
          onClick={() => setSelectedOrder(record)} 
          
        />
      )},
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Custom Print Orders</Title>
          <Text type="secondary">View customer designs, update printing statuses, and download production files.</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Input 
            prefix={<Search size={16}  />} 
            placeholder="Search by ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '256px'}}
          />
          <Button type="default" icon={<Settings size={16} />} onClick={() => setShowSettingsModal(true)} style={{ backgroundColor: 'transparent'}}>
            Manage Print Areas
          </Button>
        </div>
      </div>

      {/* Notice Editor */}
      <Card >
        <Text strong style={{ display: 'block',  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Storefront Notice</Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>Add a note to display at the top of the Custom Print page for your users (e.g. "We are currently out of large size shirts" or "Please expect 3-day delays for custom prints").</Text>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <TextArea
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="Enter notice text here... (leave blank to hide)"
            autoSize={{ minRows: 2, maxRows: 4 }}
            
          />
          <Button type="primary" icon={<Save size={16} />} onClick={handleSaveNotice} loading={isSavingNotice} style={{ fontWeight: 600, color: '#000' }}>
            Save Notice
          </Button>
        </div>
      </Card>

      <Card 
        
        bodyStyle={{ padding: 0 }}
      >
        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoading}
          locale={{ 
            emptyText: (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Empty description="No Custom Print Orders" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Custom Print Details Modal */}
      <Modal
        title={
          selectedOrder && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>Production Sheet: {selectedOrder.id}</span>
              <Tag color="purple">Custom</Tag>
            </div>
          )
        }
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={null}
        width={1000}
        styles={{ 
          body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' },
          content: {  padding: '24px' },
          header: {  borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '24px' }}}
        closeIcon={<X size={20} color="#888" />}
      >
        {selectedOrder && (
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <MockupViewer order={selectedOrder} />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <Text type="secondary">Customer</Text>
                    <Text strong >{selectedOrder.customer}</Text>
                  </div>
                  {selectedOrder.email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <Text type="secondary">Email</Text>
                      <Text strong >{selectedOrder.email}</Text>
                    </div>
                  )}
                  {selectedOrder.phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <Text type="secondary">Phone</Text>
                      <Text strong >{selectedOrder.phone}</Text>
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <Text type="secondary">Shipping</Text>
                      <Text strong style={{  textAlign: 'right', maxWidth: '200px', wordBreak: 'break-word' }}>{selectedOrder.shippingAddress}</Text>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <Text type="secondary">Print Areas</Text>
                    <Text strong style={{  textAlign: 'right', maxWidth: '200px', wordBreak: 'break-word' }}>
                      {selectedOrder.itemsList?.[0]?.selectedPrints?.map(p => p.name).join(', ') || 'N/A'}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <Text type="secondary">Total Value</Text>
                    <Text strong style={{ color: '#a3ff12', fontSize: '16px' }}>
                      ₹{selectedOrder.total?.toLocaleString() || (selectedOrder.quantity * selectedOrder.price).toLocaleString()}
                    </Text>
                  </div>

                  {selectedOrder.itemsList && selectedOrder.itemsList.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <Text style={{ fontSize: 10, textTransform: 'uppercase',  fontWeight: 600, display: 'block', marginBottom: 8 }}>Item Breakdown</Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedOrder.itemsList.map((item, idx) => (
                          <div key={idx} style={{ backgroundColor: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <Text strong >{item.name}</Text>
                              <Text strong >₹{item.itemTotal?.toLocaleString()}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between',  fontSize: '12px', marginBottom: '4px' }}>
                              <span>Qty: {item.qty} | Size: {item.selectedSize || 'N/A'}</span>
                              <span>Base: ₹{item.price} + Print: ₹{item.selectedPrints?.reduce((sum, p) => sum + (Number(p.cost) || 0), 0) || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',  fontSize: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                              <span>Color: {item.selectedColor || 'Black'}</span>
                              <Space>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: item.selectedColorHex || '#000000', border: '1px solid #444' }}></div>
                                <Text code style={{ color: '#a3ff12', backgroundColor: 'transparent', padding: 0 }}>{item.selectedColorHex || '#000000'}</Text>
                              </Space>
                            </div>
                            
                            {item.printingInstructions && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                                <Text style={{ fontSize: 10,  display: 'block', marginBottom: '4px' }}>PRINTING INSTRUCTIONS:</Text>
                                <Text style={{ color: '#ccc', fontStyle: 'italic', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{item.printingInstructions}</Text>
                              </div>
                            )}

                            {item.uploadedImages && Object.keys(item.uploadedImages).length > 0 && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                                <Text style={{ fontSize: 10,  display: 'block', marginBottom: '4px' }}>UPLOADED DESIGNS:</Text>
                                <Space wrap size={[8, 8]}>
                                  {Object.entries(item.uploadedImages).map(([zone, url]) => (
                                    <a key={zone} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center' }}>
                                      <div style={{ width: 48, height: 48,  border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={url} alt={zone} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                      </div>
                                      <Text style={{ fontSize: '9px'}}>{zone}</Text>
                                    </a>
                                  ))}
                                </Space>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <div style={{ marginTop: '16px', backgroundColor: 'rgba(250, 140, 22, 0.1)', border: '1px solid rgba(250, 140, 22, 0.3)', padding: '12px', borderRadius: '8px' }}>
                      <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#fa8c16', fontWeight: 600, display: 'block', marginBottom: 4 }}>Customer Note:</Text>
                      <Text style={{ color: '#fa8c16' }}>{selectedOrder.notes}</Text>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.designUrl && (
                    <a href={selectedOrder.designUrl} download="customer_design.svg" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                      <Button type="primary" block icon={<Download size={16} />} style={{ fontWeight: 600, color: '#000' }}>
                        Download User Design
                      </Button>
                    </a>
                  )}
                  <Button block onClick={() => setSelectedOrder(null)} style={{ backgroundColor: 'transparent'}}>
                    Close Window
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Print Settings Modal */}
      <Modal
        open={showSettingsModal}
        onCancel={() => setShowSettingsModal(false)}
        footer={null}
        width={900}
        closable={false}
        styles={{ 
          body: { maxHeight: '80vh', overflowY: 'auto', padding: 0 },
          content: { backgroundColor: 'transparent', padding: 0, boxShadow: 'none' }}}
        destroyOnClose
      >
        <div style={{ position: 'relative' }}>
          <Button 
            type="text" 
            icon={<X size={24} />} 
            onClick={() => setShowSettingsModal(false)} 
            style={{ position: 'absolute', right: 0, top: -40}}
          />
          <PrintSettings />
        </div>
      </Modal>
    </div>
  );
}
