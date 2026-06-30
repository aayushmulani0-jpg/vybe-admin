import { Bell, Menu as MenuIcon, Sun, Moon } from 'lucide-react';
import { Layout, Badge, Button } from 'antd';
import { useUIStore } from '../../store/useUIStore';

const { Header: AntHeader } = Layout;

export default function Header() {
  const { theme, toggleTheme } = useUIStore();
  return (
    <AntHeader
      style={{
        padding: '0 32px',
        background: theme === 'dark' ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: '64px',
        lineHeight: '64px'
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          type="text" 
          icon={<MenuIcon size={20} />} 
          style={{ color: theme === 'dark' ? '#888' : '#555', display: 'none' }} // Hidden on lg screens in actual app, simplify for now
          className="mobile-menu-btn"
        />
        <h2 style={{ fontSize: '18px', fontWeight: 500, color: theme === 'dark' ? '#fff' : '#000', margin: 0 }} className="header-title hidden sm:block">
          Overview
        </h2>
      </div>

      {/* Right side: Search & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Button 
          type="text" 
          icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} 
          onClick={toggleTheme}
          style={{ color: theme === 'dark' ? '#888' : '#555' }} 
        />
        <Badge dot color="#a3ff12">
          <Button type="text" icon={<Bell size={20} />} style={{ color: theme === 'dark' ? '#888' : '#555' }} />
        </Badge>
      </div>
    </AntHeader>
  );
}
