import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import Button from '../components/common/Button';
import { Lock, Mail } from 'lucide-react';

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
      <div className="w-full max-w-md bg-neutral-900 rounded-xl shadow-2xl p-8 border border-vybe-glassBorder">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">VYBE <span className="text-vybe-neon">ADMIN</span></h1>
          <p className="text-gray-400 text-sm">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-md bg-black text-white placeholder-gray-500 focus:outline-none focus:border-vybe-neon transition-colors"
                placeholder="admin@vybe.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-md bg-black text-white placeholder-gray-500 focus:outline-none focus:border-vybe-neon transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>

        {hasAdmin === false && (
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-sm text-gray-400 mb-3">No admin account found in the system.</p>
            <Button variant="secondary" size="sm" onClick={() => navigate('/register')}>
              Create First Admin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
