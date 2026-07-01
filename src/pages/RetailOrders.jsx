import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useUIStore } from '../store/useUIStore';
import { Eye, FileText, Search, X } from 'lucide-react';
import { Table, Card, Input, Button, Tag, Typography, Row, Col, Space, Empty, Modal } from 'antd';

const { Title, Text } = Typography;

export default function RetailOrders() {
  const { retailOrders, fetchOrders, updateOrderDetails, isLoading } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { alert } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Editable fields for shipping
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

  const RETAIL_STATUSES = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'processing';
      case 'Shipped': return 'purple';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const filteredOrders = retailOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesId = order.id?.toLowerCase().includes(query);
    const matchesCustomer = order.customer?.toLowerCase().includes(query);
    const matchesEmail = order.email?.toLowerCase().includes(query);
    return matchesId || matchesCustomer || matchesEmail;
  });

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong className="text-white">{text.slice(-8).toUpperCase()}</Text>},
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
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'Paid' ? 'success' : 'warning'}>
          {status || 'Pending'}
        </Tag>
      )},
    {
      title: 'Total',
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
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Retail Orders</Title>
          <Text type="secondary">Manage individual consumer orders, payments, and shipping.</Text>
        </div>
        <Input 
          prefix={<Search size={16}  />} 
          placeholder="Search by ID or Name..."
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
                <Empty description="No Retail Orders" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
              <span style={{ fontSize: '20px' }}>Order #{selectedOrder.id.slice(-8).toUpperCase()}</span>
              <Tag color="blue">Retail</Tag>
            </div>
          )
        }
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedOrder(null)} style={{ backgroundColor: 'transparent'}}>
            Close
          </Button>,
          <Button key="invoice" type="primary" icon={<FileText size={16} />} style={{ fontWeight: 600, color: '#000' }}>
            Download Invoice
          </Button>
        ]}
        width={900}
        styles={{ 
          body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' },
          content: {  padding: '24px' },
          header: {  borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '24px' },
          footer: { borderTop: '1px solid #333', paddingTop: '16px', marginTop: '24px' }}}
        closeIcon={<X size={20} color="#888" />}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px',  fontSize: '14px', flexWrap: 'wrap' }}>
              <span>Placed on {selectedOrder.date}</span>
              <span>•</span>
              <span>{selectedOrder.items} Items</span>
              <span>•</span>
              <span style={{ color: '#a3ff12', fontWeight: 600 }}>Total: ₹{selectedOrder.total?.toLocaleString() || 0}</span>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card 
                  title="Ordered Items" 
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
                  styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)'}, body: { padding: 0 } }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {selectedOrder.itemsList && selectedOrder.itemsList.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', borderBottom: idx < selectedOrder.itemsList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: '16px' }}>
                        <div style={{ width: 80, height: 80, backgroundColor: '#111', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Text strong style={{  fontSize: 16 }}>{item.name}</Text>
                            <Text strong >₹{item.price * item.qty}</Text>
                          </div>
                          <Text style={{  fontSize: 14 }}>₹{item.price} × {item.qty}</Text>
                          
                          {(item.selectedSize || item.selectedColor) && (
                            <Space style={{ marginTop: 8 }}>
                              {item.selectedSize && <Tag style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ccc' }}>Size: {item.selectedSize}</Tag>}
                              {item.selectedColor && (
                                <Tag style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ccc', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  Color: <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.selectedColor.toLowerCase(), border: '1px solid rgba(255,255,255,0.2)' }}></span>{item.selectedColor}
                                </Tag>
                              )}
                            </Space>
                          )}

                          {item.selectedPrints && item.selectedPrints.length > 0 && (
                            <div style={{ marginTop: 12, backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                              <Text style={{ fontSize: 10, textTransform: 'uppercase',  fontWeight: 600, display: 'block', marginBottom: 4 }}>Print Configuration</Text>
                              <Space wrap>
                                {item.selectedPrints.map((p, i) => (
                                  <Tag key={i} color="lime" style={{ margin: 0, backgroundColor: 'rgba(163,255,18,0.1)', borderColor: 'rgba(163,255,18,0.2)', color: '#a3ff12' }}>
                                    {p.name} (+₹{p.cost})
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          )}

                          {item.uploadedImages && Object.keys(item.uploadedImages).length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 10, textTransform: 'uppercase',  fontWeight: 600, display: 'block', marginBottom: 8 }}>Customer Designs</Text>
                              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                                {Object.entries(item.uploadedImages).map(([zone, url]) => (
                                  <a key={zone} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', flexShrink: 0 }}>
                                    <div style={{ width: 64, height: 64, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                      <img src={url} alt={zone} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: 4, fontSize: 10, color: '#ccc' }}>{zone}</div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card 
                  title="Customer Details" 
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
                  styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)'}, body: { padding: '20px' } }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Name</Text>
                      <Text strong >{selectedOrder.customer}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email</Text>
                      <Text strong >{selectedOrder.email}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Phone</Text>
                      <Text strong >{selectedOrder.phone}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Shipping Address</Text>
                      <Text strong >{selectedOrder.shippingAddress || 'N/A'}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}

