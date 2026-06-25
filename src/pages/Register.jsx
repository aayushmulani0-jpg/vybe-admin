import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import Button from '../components/common/Button';
import { Lock, Mail, User } from 'lucide-react';

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
      <div className="w-full max-w-md bg-neutral-900 rounded-xl shadow-2xl p-8 border border-vybe-neon/50">
        <div className="text-center mb-8">
          <div className="bg-vybe-neon text-black text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">
            System Initialization
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Root Admin</h1>
          <p className="text-gray-400 text-sm">Register the primary administrator account. Only 1 admin is allowed.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-md bg-black text-white placeholder-gray-500 focus:outline-none focus:border-vybe-neon transition-colors"
                placeholder="John Doe"
              />
            </div>
          </div>

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
            {loading ? 'Creating...' : 'Create Admin Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
