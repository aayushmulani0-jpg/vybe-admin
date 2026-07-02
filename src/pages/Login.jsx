import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { Input, Button, Alert, Card, Typography } from 'antd';
import { Lock, Mail } from 'lucide-react';

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  
  const { login, verifyOtp, loading, error, hasAdmin, checkAdminExists, requiresOtp } = useAdminAuthStore();

  useEffect(() => {
    checkAdminExists();
  }, [checkAdminExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (requiresOtp) {
        await verifyOtp(otp);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Error is handled by store and displayed via {error}
    }
  };

  useEffect(() => {
    if (useAdminAuthStore.getState().user) {
      navigate('/');
    }
  }, [navigate, requiresOtp]); // Also re-check when requiresOtp changes just in case

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
          {!requiresOtp ? (
            <>
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
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Enter 6-Digit OTP</label>
              <Input 
                size="large"
                prefix={<Lock className="w-5 h-5 text-vybe-neon" />}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="696969"
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">Please enter your 2-step verification code.</p>
            </div>
          )}

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            style={{ marginTop: 16, height: 48, fontWeight: 500, color: '#000' }}
          >
            {loading ? 'Authenticating...' : requiresOtp ? 'Verify OTP' : 'Secure Login'}
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
