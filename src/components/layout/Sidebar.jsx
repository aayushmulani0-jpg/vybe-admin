import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Palette,
  Settings,
  BookOpen,
  DollarSign,
  LogOut,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';

const { Sider } = Layout;

export default function Sidebar() {
  const { user, logout } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/inventory', icon: <Package size={18} />, label: 'Products & Inventory' },
    { key: '/retail-orders', icon: <ShoppingCart size={18} />, label: 'Retail Orders' },
    { key: '/wholesale-orders', icon: <Package size={18} />, label: 'Wholesale Orders' },
    { key: '/custom-print', icon: <Palette size={18} />, label: 'Custom Print' },
    { key: '/catalogues', icon: <BookOpen size={18} />, label: 'Wholesale Catalogues' },
    { key: '/collections', icon: <Layers size={18} />, label: 'Collections & Drops' },
    { key: '/banners', icon: <ImageIcon size={18} />, label: 'Marketing Banners' },
    { key: '/customers', icon: <Users size={18} />, label: 'Customers' },
    { key: '/pricing', icon: <DollarSign size={18} />, label: 'Discounts & Charges' },
    { key: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <Sider
      width={256}
      theme="dark"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: '1px solid #333'}}
    >
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #333' }}>
        <h1 className="text-2xl font-bold tracking-tighter text-white m-0">
          VYBE<span style={{ color: '#a3ff12' }}>.</span>
          <span className="text-xs ml-2 text-gray-400 font-normal uppercase tracking-widest">Admin</span>
        </h1>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
        style={{
          padding: '16px 8px',
          borderRight: 0,
          backgroundColor: 'transparent'
        }}
      />

      <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '16px', borderTop: '1px solid #333'}}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <Avatar style={{ backgroundColor: '#a3ff12', color: '#000', fontWeight: 'bold' }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <div style={{ minWidth: 0, paddingRight: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500,  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Admin User'}
              </div>
              <div style={{ fontSize: '12px',  textTransform: 'capitalize' }}>
                {user?.role || 'Super Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: 'none',  cursor: 'pointer', padding: '4px' }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </Sider>
  );
}
