import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { Input, Button, Alert, Card, Typography } from 'antd';
import { Lock, Mail } from 'lucide-react';

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const { login, loading, error, checkAdminExists, hasAdmin } = useAdminAuthStore();

  useEffect(() => {
    checkAdminExists();
  }, [checkAdminExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-vybe-dark flex flex-col justify-center items-center p-4">
      <Card 
        style={{ width: '100%', maxWidth: 400}}
        bodyStyle={{ padding: '32px' }}
      >
        <div className="text-center mb-8">
          <Title level={2} style={{  marginBottom: 8, margin: 0 }}>
            VYBE <span style={{ color: '#a3ff12' }}>ADMIN</span>
          </Title>
          <Text type="secondary">Sign in to access the dashboard</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <Input 
              size="large"
              prefix={<Mail className="w-5 h-5 text-gray-500" />}
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vybe.com"
              
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input.Password 
              size="large"
              prefix={<Lock className="w-5 h-5 text-gray-500" />}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              
            />
          </div>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            style={{ marginTop: 16, height: 48, fontWeight: 500, color: '#000' }}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>

        {hasAdmin === false && (
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-sm text-gray-400 mb-3">No admin account found in the system.</p>
            <Button size="small" onClick={() => navigate('/register')} >
              Create First Admin
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
