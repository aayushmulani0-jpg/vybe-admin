import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Palette, Users, Clock, CheckCircle, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config';
import { Card, Button, Spin, Typography, Row, Col, List, Avatar, Empty } from 'antd';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {
      totalRevenue: 0,
      retailOrdersCount: 0,
      customOrdersCount: 0,
      customersCount: 0,
      totalProducts: 0
    },
    revenueOverview: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const result = await response.json();
      if (result.success) {
        setData({
          stats: result.stats,
          revenueOverview: result.revenueOverview,
          recentActivity: result.recentActivity
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const { stats, revenueOverview, recentActivity } = data;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Dashboard</Title>
          <Text type="secondary">Welcome back! Here's what's happening with Vybe today.</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="default" style={{ backgroundColor: 'transparent'}}>
            Export Report
          </Button>
          <Button type="primary" style={{ color: '#000', fontWeight: 600 }}>
            + New Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} trend="" icon={TrendingUp} positive />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard title="Retail Orders" value={stats.retailOrdersCount} trend="" icon={ShoppingBag} positive />
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <StatCard title="Pending Custom" value={stats.customOrdersCount} trend="" icon={Palette} />
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <StatCard title="New Customers" value={stats.customersCount} trend="" icon={Users} positive />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <StatCard title="Total Products" value={stats.totalProducts} trend="" icon={Package} positive />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card 
            title="Revenue Overview" 
            style={{   height: '100%' }}
            headStyle={{  borderBottom: '1px solid #333' }}
            bodyStyle={{ height: 'calc(100% - 57px)', padding: '24px' }}
          >
            <div style={{ width: '100%', height: '100%', minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666" 
                    tick={{fill: '#666'}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#666" 
                    tick={{fill: '#666'}}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#A3FF12' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#A3FF12" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#A3FF12', strokeWidth: 2, stroke: '#111' }}
                    activeDot={{ r: 6, fill: '#A3FF12', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card 
            title="Recent Activity" 
            style={{   height: '100%' }}
            headStyle={{  borderBottom: '1px solid #333' }}
            bodyStyle={{ padding: 0 }}
          >
            <List
              dataSource={recentActivity}
              locale={{ emptyText: <Empty description="No recent activity" /> }}
              renderItem={(activity) => (
                <List.Item style={{ padding: '16px 24px', borderBottom: '1px solid #333' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: (activity.status === 'Completed' || activity.status === 'Delivered') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: (activity.status === 'Completed' || activity.status === 'Delivered') ? '#4ade80' : '#a3ff12' 
                        }}
                        icon={(activity.status === 'Completed' || activity.status === 'Delivered') ? <CheckCircle size={16} /> : <Clock size={16} />}
                      />
                    }
                    title={
                      <span >New {activity.orderType} Order</span>
                    }
                    description={
                      <div>
                        <div style={{  fontSize: '12px' }}>
                          {activity.customer || activity.email || 'Unknown Customer'} - {formatCurrency(activity.total || 0)}
                        </div>
                        <div style={{  fontSize: '12px' }}>
                          {new Date(activity.createdAt || activity.date || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, positive }) {
  return (
    <Card 
      style={{   height: '100%' }}
      bodyStyle={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex' }}>
          <Icon size={20} color="#a3ff12" />
        </div>
        {trend && (
          <span style={{ fontSize: '14px', fontWeight: 500, color: positive ? '#4ade80' : '#f87171' }}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <div style={{  fontSize: '14px', marginBottom: '4px' }}>{title}</div>
        <Title level={3} style={{  margin: 0 }}>{value}</Title>
      </div>
    </Card>
  );
}
