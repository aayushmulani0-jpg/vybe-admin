import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useUIStore } from '../store/useUIStore';
import { Eye, Send, Search, X } from 'lucide-react';
import MockupViewer from '../components/custom-print/MockupViewer';
import { Table, Card, Input, Button, Tag, Typography, Row, Col, Space, Empty, Modal } from 'antd';

const { Title, Text } = Typography;

export default function WholesaleOrders() {
  const { wholesaleOrders, fetchOrders, updateOrderDetails, isLoading } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { alert } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [editShipping, setEditShipping] = useState({ courier: '', trackingNumber: '' });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (selectedOrder && selectedOrder.shippingDetails) {
      setEditShipping({
        courier: selectedOrder.shippingDetails.courier || '',
        trackingNumber: selectedOrder.shippingDetails.trackingNumber || ''
      });
    } else {
      setEditShipping({ courier: '', trackingNumber: '' });
    }
  }, [selectedOrder]);

  const WHOLESALE_STATUSES = ['Inquiry', 'Quotation Sent', 'Payment Pending', 'Production', 'Ready To Ship', 'Shipped', 'Delivered'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Production': return 'warning';
      case 'Ready To Ship': return 'processing';
      case 'Shipped': return 'purple';
      case 'Quotation Sent': return 'cyan';
      default: return 'default';
    }
  };

  const filteredOrders = wholesaleOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesId = order.id?.toLowerCase().includes(query);
    const matchesCompany = order.company?.toLowerCase().includes(query);
    const matchesCustomer = order.customer?.toLowerCase().includes(query) || order.contact?.toLowerCase().includes(query);
    return matchesId || matchesCompany || matchesCustomer;
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
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (text, record) => <Text strong>{text || record.customer}</Text>},
    {
      title: 'Est. Qty',
      key: 'qty',
      render: (_, record) => record.itemsList ? record.itemsList.reduce((sum, item) => sum + item.qty, 0) : record.items || record.quantity || 1},
    {
      title: 'Value',
      key: 'total',
      render: (_, record) => {
        const total = record.total || (record.itemsList ? record.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : 0);
        return <Text strong style={{ color: '#a3ff12' }}>₹{total.toLocaleString()}</Text>;
      }},
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )},
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
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
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Wholesale & B2B Orders</Title>
          <Text type="secondary">Manage bulk inquiries, quotes, production tracking, and B2B logistics.</Text>
        </div>
        <Input 
          prefix={<Search size={16}  />} 
          placeholder="Search by ID or Company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '256px'}}
        />
      </div>

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
                <Empty description="No Wholesale Inquiries" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={
          selectedOrder && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>B2B Order: {selectedOrder.id.slice(-8).toUpperCase()}</span>
              <Tag color="cyan">Wholesale</Tag>
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
                    <Text type="secondary">Company</Text>
                    <Text strong >{selectedOrder.company || 'N/A'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <Text type="secondary">Contact</Text>
                    <Text strong >{selectedOrder.customer || selectedOrder.contact}</Text>
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
                    <Text type="secondary">Quoted Value</Text>
                    <Text strong style={{ color: '#a3ff12', fontSize: '16px' }}>
                      ₹{selectedOrder.total?.toLocaleString() || (selectedOrder.itemsList ? selectedOrder.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : 0).toLocaleString()}
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
                              <Text strong >₹{(item.itemTotal || (item.price * item.qty)).toLocaleString()}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between',  fontSize: '12px' }}>
                              <span>Bulk Qty: {item.qty} | Size: {item.selectedSize || 'N/A'}</span>
                              <span>₹{item.price}/unit</span>
                            </div>
                            
                            {item.selectedPrints && item.selectedPrints.length > 0 && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                                <Text style={{ fontSize: 10,  display: 'block', marginBottom: '4px' }}>CUSTOMIZATIONS:</Text>
                                <Space wrap size={[0, 4]}>
                                  {item.selectedPrints.map((p, i) => (
                                    <Tag key={i} color="lime" style={{ margin: 0, marginRight: 4, backgroundColor: 'rgba(163,255,18,0.1)', borderColor: 'rgba(163,255,18,0.2)', color: '#a3ff12', fontSize: '10px' }}>
                                      {p.name} (+₹{p.cost}/unit)
                                    </Tag>
                                  ))}
                                </Space>
                              </div>
                            )}

                            {item.uploadedImages && Object.keys(item.uploadedImages).length > 0 && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                                <Text style={{ fontSize: 10,  display: 'block', marginBottom: '4px' }}>ATTACHED FILES:</Text>
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
                      <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#fa8c16', fontWeight: 600, display: 'block', marginBottom: 4 }}>Client Note:</Text>
                      <Text style={{ color: '#fa8c16' }}>{selectedOrder.notes}</Text>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button type="primary" block icon={<Send size={16} />} style={{ fontWeight: 600, color: '#000' }}>
                    Send Official Quote / Invoice
                  </Button>
                  <Button block onClick={() => setSelectedOrder(null)} style={{ backgroundColor: 'transparent'}}>
                    Close Window
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
}
