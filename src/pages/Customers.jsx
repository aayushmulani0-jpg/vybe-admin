import { useState, useEffect } from 'react';
import { useCustomerStore } from '../store/useCustomerStore';
import { Users, Eye, X, Mail, ShoppingBag, TrendingUp, Calendar, MapPin, Tag, Search } from 'lucide-react';
import { Table, Card, Input, Button, Tag as AntTag, Typography, Row, Col, Space, Empty, Modal } from 'antd';

const { Title, Text } = Typography;

export default function Customers() {
  const { customers, isLoading, fetchCustomersAndOrders } = useCustomerStore();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomersAndOrders();
  }, [fetchCustomersAndOrders]);

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const matchesName = customer.name?.toLowerCase().includes(query);
    const matchesEmail = customer.email?.toLowerCase().includes(query);
    return matchesName || matchesEmail;
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong >{text}</Text>},
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'},
    {
      title: 'Total Orders',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (text) => <Text strong >{text}</Text>},
    {
      title: 'Lifetime Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (text) => <Text strong style={{ color: '#a3ff12' }}>₹{text?.toLocaleString() || 0}</Text>},
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <AntTag color={type === 'Repeat' ? 'lime' : 'blue'} style={type === 'Repeat' ? { backgroundColor: 'rgba(163,255,18,0.1)', borderColor: 'rgba(163,255,18,0.3)', color: '#a3ff12' } : {}}>
          {type}
        </AntTag>
      )},
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<Eye size={16} />} 
          onClick={() => setSelectedCustomer(record)} 
          
          title="View Full Profile"
        />
      )},
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Customers</Title>
          <Text type="secondary">View registered users, order history, and lifetime value.</Text>
        </div>
        <Input 
          prefix={<Search size={16}  />} 
          placeholder="Search by name or email..."
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
          dataSource={filteredCustomers} 
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          locale={{ 
            emptyText: (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Empty description="No Customers Yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Full Customer Profile Modal */}
      <Modal
        title={null}
        open={!!selectedCustomer}
        onCancel={() => setSelectedCustomer(null)}
        footer={null}
        width={1000}
        closeIcon={null}
        styles={{ 
          body: { padding: 0, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
          content: {  padding: 0, overflow: 'hidden', borderRadius: '12px' }}}
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(to bottom right, rgba(163,255,18,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(163,255,18,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold',  textTransform: 'uppercase', boxShadow: '0 0 15px rgba(204,255,0,0.15)' }}>
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <Title level={3} style={{  margin: 0, marginBottom: '4px' }}>{selectedCustomer.name}</Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AntTag color={selectedCustomer.type === 'Repeat' ? 'lime' : 'blue'} style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {selectedCustomer.type} Customer
                    </AntTag>
                    <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Calendar size={12} /> Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </div>
              <Button type="text" icon={<X size={20} />} onClick={() => setSelectedCustomer(null)}  />
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <Row gutter={[24, 24]}>
                {/* Left Column: Contact & Stats */}
                <Col xs={24} lg={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Stats Summary */}
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Text style={{ fontSize: '12px', fontWeight: 600,  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>Customer Value</Text>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Text style={{ fontSize: '12px',  display: 'block', marginBottom: '4px' }}>Total Orders</Text>
                            <Text strong style={{ fontSize: '20px'}}>{selectedCustomer.orderCount}</Text>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Text style={{ fontSize: '12px',  display: 'block', marginBottom: '4px' }}>Lifetime Spent</Text>
                            <Text strong style={{ fontSize: '20px', color: '#a3ff12' }}>₹{selectedCustomer.totalSpent?.toLocaleString() || 0}</Text>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Contact Info */}
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Text style={{ fontSize: '12px', fontWeight: 600,  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>Contact Info</Text>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <Mail size={16} color="#888" style={{ marginTop: '2px' }} />
                        <div>
                          <Text strong style={{  display: 'block', wordBreak: 'break-all' }}>{selectedCustomer.email}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Primary Email</Text>
                        </div>
                      </div>
                    </div>

                    {/* Saved Addresses */}
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Text style={{ fontSize: '12px', fontWeight: 600,  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>Saved Addresses ({selectedCustomer.addresses?.length || 0})</Text>
                      {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {selectedCustomer.addresses.map((addr, i) => (
                            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <Text strong style={{  display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <MapPin size={12} color="#a3ff12" /> {addr.label || 'Home'}
                                </Text>
                                {addr.isDefault && <AntTag style={{ margin: 0, fontSize: '10px' }}>DEFAULT</AntTag>}
                              </div>
                              <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.5' }}>{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</Text>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text type="secondary" style={{ fontSize: '14px', fontStyle: 'italic' }}>No saved addresses.</Text>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Right Column: Ordered Items Ledger */}
                <Col xs={24} lg={16}>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <ShoppingBag size={16} color="#888" />
                      <Text strong >Purchase Ledger</Text>
                    </div>

                    <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                      {selectedCustomer.purchasedItems && selectedCustomer.purchasedItems.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {selectedCustomer.purchasedItems.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                              <div style={{ width: '80px', height: '80px', backgroundColor: '#111', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                                <img
                                  src={item.image || 'https://via.placeholder.com/150'}
                                  alt={item.name}
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <Text strong style={{  fontSize: '16px', display: 'block', marginBottom: '4px' }}>{item.name}</Text>
                                    <Space size="small" style={{ flexWrap: 'wrap' }}>
                                      <AntTag color="default" style={{ margin: 0 }}>Order: #{item.orderId?.slice(-6).toUpperCase()}</AntTag>
                                      <Text type="secondary" style={{ fontSize: '10px' }}>{item.orderDate}</Text>
                                      {item.orderType && (
                                        <AntTag color={
                                          item.orderType === 'Wholesale' ? 'blue' :
                                          item.orderType === 'CustomPrint' ? 'purple' : 'lime'
                                        } style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                          {item.orderType}
                                        </AntTag>
                                      )}
                                    </Space>
                                  </div>
                                  <Text strong style={{  fontSize: '18px', marginLeft: '8px' }}>₹{(item.itemTotal || (item.price * item.qty)).toLocaleString()}</Text>
                                </div>

                                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                                  <Text type="secondary" style={{ fontSize: '14px' }}>Qty: <Text strong >{item.qty}</Text> @ ₹{item.price}</Text>
                                  {(item.selectedSize || item.selectedColor) && (
                                    <>
                                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                                      {item.selectedSize && <Text type="secondary" style={{ fontSize: '14px' }}>Size: <Text strong >{item.selectedSize}</Text></Text>}
                                      {item.selectedColor && (
                                        <Text type="secondary" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>Color:
                                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: item.selectedColor.toLowerCase(), display: 'inline-block' }}></span>
                                          <Text strong >{item.selectedColor}</Text>
                                        </Text>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Selected Prints */}
                                {item.selectedPrints && item.selectedPrints.length > 0 && (
                                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                      <Tag size={12} color="#888" />
                                      <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Customizations</Text>
                                    </div>
                                    <Space wrap size={[8, 8]}>
                                      {item.selectedPrints.map((p, i) => (
                                        <AntTag key={i} color="default" style={{ margin: 0, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                          {p.name} <Text type="secondary" style={{ marginLeft: '4px' }}>(+₹{p.cost})</Text>
                                        </AntTag>
                                      ))}
                                    </Space>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',  padding: '48px 0' }}>
                          <ShoppingBag size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                          <Text type="secondary">This customer hasn't purchased anything yet.</Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
