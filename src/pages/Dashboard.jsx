import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Palette, Users, Clock, CheckCircle, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config';

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
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-vybe-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back! Here's what's happening with Vybe today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-vybe-glass border border-vybe-glassBorder rounded-lg text-sm font-medium hover:bg-vybe-glassBorder transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-vybe-neon text-black rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(163,255,18,0.3)] hover:shadow-[0_0_20px_rgba(163,255,18,0.5)] transition-all">
            + New Order
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} trend="" icon={TrendingUp} positive />
        <StatCard title="Retail Orders" value={stats.retailOrdersCount} trend="" icon={ShoppingBag} positive />
        <StatCard title="Pending Custom" value={stats.customOrdersCount} trend="" icon={Palette} />
        <StatCard title="New Customers" value={stats.customersCount} trend="" icon={Users} positive />
        <StatCard title="Total Products" value={stats.totalProducts} trend="" icon={Package} positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-panel p-6 h-[400px] flex flex-col">
          <h3 className="font-semibold mb-6">Revenue Overview</h3>
          <div className="flex-1 w-full h-full">
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
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 h-[400px] flex flex-col">
          <h3 className="font-semibold mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {recentActivity.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No recent activity</div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity._id} className="flex gap-4 p-3 rounded-lg hover:bg-vybe-glass/50 transition-colors">
                  <div className={`p-2 rounded-full h-fit ${activity.status === 'Completed' || activity.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-vybe-glassBorder text-vybe-neon'}`}>
                    {activity.status === 'Completed' || activity.status === 'Delivered' ? <CheckCircle size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      New {activity.orderType} Order
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.customer || activity.email || 'Unknown Customer'} - {formatCurrency(activity.total || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt || activity.date || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, positive }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-vybe-glass rounded-lg">
          <Icon className="w-5 h-5 text-vybe-neon" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
      </div>
    </div>
  );
}
