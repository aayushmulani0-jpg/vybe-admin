import { TrendingUp, ShoppingBag, Palette, Users } from 'lucide-react';

export default function Dashboard() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₹2,45,000" trend="+12.5%" icon={TrendingUp} positive />
        <StatCard title="Retail Orders" value="156" trend="+5.2%" icon={ShoppingBag} positive />
        <StatCard title="Pending Custom" value="23" trend="-2.1%" icon={Palette} />
        <StatCard title="New Customers" value="84" trend="+18.2%" icon={Users} positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for Charts */}
        <div className="lg:col-span-2 glass-panel p-6 h-96 flex flex-col">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="flex-1 border-2 border-dashed border-vybe-glassBorder rounded-xl flex items-center justify-center text-gray-500">
            [ Recharts Line Graph Placeholder ]
          </div>
        </div>

        {/* Placeholder for Recent Activity */}
        <div className="glass-panel p-6 h-96 flex flex-col">
          <h3 className="font-semibold mb-4">Recent Custom Approvals</h3>
          <div className="flex-1 border-2 border-dashed border-vybe-glassBorder rounded-xl flex items-center justify-center text-gray-500">
            [ Activity Feed Placeholder ]
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
        <span className={`text-sm font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
      </div>
    </div>
  );
}
