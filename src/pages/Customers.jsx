import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { API_URL } from '../config';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Note: Since auth token logic wasn't fully built in admin side before,
  // we assume the admin has a token stored somewhere, or we just fetch directly if disabled.
  // For production, the Admin should have a login flow storing a token.
  const token = localStorage.getItem('vybe-admin-token'); 
  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Customers</h1>
          <p className="text-gray-400">Manage registered users and view their details</p>
        </div>
        <div className="bg-vybe-glass border border-vybe-glassBorder rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-vybe-neon/10 rounded-lg">
            <Users className="w-6 h-6 text-vybe-neon" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-vybe-surface border border-vybe-glassBorder rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-vybe-glass">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Addresses</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vybe-glassBorder">
                {customers.map(customer => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={customer._id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vybe-neon to-green-600 flex items-center justify-center text-black font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-xs text-gray-400">ID: {customer._id.substring(customer._id.length - 6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="w-3 h-3 text-gray-500" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="w-3 h-3 text-gray-500" /> {customer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="w-3 h-3 text-gray-500" /> {customer.addresses?.length || 0} addresses
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="w-3 h-3 text-gray-500" /> 
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
