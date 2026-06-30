import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { Input, Button, Alert, Card, Typography } from 'antd';
import { Lock, Mail, User } from 'lucide-react';

const { Title, Text } = Typography;

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const { registerAdmin, loading, error, checkAdminExists, hasAdmin } = useAdminAuthStore();

  useEffect(() => {
    // Check if admin already exists
    const check = async () => {
      const exists = await checkAdminExists();
      if (exists) {
        navigate('/login'); // Redirect if an admin is already registered
      }
    };
    check();
  }, [checkAdminExists, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerAdmin(name, email, password);
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  // If we are still checking or if an admin exists, don't render the form
  if (hasAdmin === true || hasAdmin === null) {
    return (
      <div className="min-h-screen bg-vybe-dark flex items-center justify-center p-4">
        <div className="text-center text-gray-400">
          Checking registration eligibility...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vybe-dark flex flex-col justify-center items-center p-4">
      <Card 
        style={{ width: '100%', maxWidth: 400,  borderColor: '#a3ff1280' }}
        bodyStyle={{ padding: '32px' }}
      >
        <div className="text-center mb-8">
          <div className="bg-vybe-neon text-black text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">
            System Initialization
          </div>
          <Title level={3} style={{  marginBottom: 8, margin: 0 }}>Create Root Admin</Title>
          <Text type="secondary">Register the primary administrator account. Only 1 admin is allowed.</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <Input 
              size="large"
              prefix={<User className="w-5 h-5 text-gray-500" />}
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              
            />
          </div>

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
            {loading ? 'Creating...' : 'Create Admin Account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
