import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Palette,
  Settings,
  BookOpen,
  FileText,
  DollarSign,
  LogOut,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products & Inventory', path: '/inventory', icon: Package },
  { name: 'Retail Orders', path: '/retail-orders', icon: ShoppingCart },
  { name: 'Wholesale Orders', path: '/wholesale-orders', icon: Package },
  { name: 'Custom Print', path: '/custom-print', icon: Palette },
  { name: 'Wholesale Catalogues', path: '/catalogues', icon: BookOpen },
  { name: 'Collections & Drops', path: '/collections', icon: Layers },
  { name: 'Marketing Banners', path: '/banners', icon: ImageIcon },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Discounts & Charges', path: '/pricing', icon: DollarSign },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-vybe-surface border-r border-vybe-glassBorder flex flex-col fixed left-0 top-0 z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-vybe-glassBorder">
        <h1 className="text-2xl font-bold tracking-tighter">
          VYBE<span className="text-vybe-neon">.</span>
          <span className="text-xs ml-2 text-gray-400 font-normal uppercase tracking-widest">Admin</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                  ? 'text-vybe-dark bg-vybe-neon font-medium shadow-[0_0_15px_rgba(163,255,18,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-vybe-glass'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-vybe-dark' : 'group-hover:text-vybe-neon transition-colors'}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-vybe-neon rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Summary */}
      <div className="p-4 border-t border-vybe-glassBorder">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-vybe-neon to-green-600 flex items-center justify-center text-black font-bold text-sm shrink-0 uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Super Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
