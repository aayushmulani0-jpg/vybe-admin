import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { Package, Eye, Send, X } from 'lucide-react';

export default function WholesaleOrders() {
  const { wholesaleOrders, updateWholesaleStatus, fetchOrders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const WHOLESALE_STATUSES = ['Inquiry', 'Quotation Sent', 'Payment Pending', 'Production', 'Ready To Ship', 'Delivered'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Production': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Ready To Ship': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Quotation Sent': return 'text-vybe-neon bg-vybe-neon/10 border-vybe-neon/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Wholesale Orders</h1>
          <p className="text-sm text-gray-400">Manage bulk inquiries, quotes, and production tracking.</p>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wholesaleOrders.map((order) => (
                <tr key={order.id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4 font-semibold">{order.company}</td>
                  <td className="px-6 py-4">{order.contact}</td>
                  <td className="px-6 py-4 font-bold text-vybe-neon">₹{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-vybe-glassBorder" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {wholesaleOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-vybe-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-vybe-glassBorder">
                      <Package className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Wholesale Inquiries</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto">When B2B clients request quotes from your live catalogue, they will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Wholesale Details: {selectedOrder.id}</h2>
            
            <div className="space-y-6 text-sm overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              
              {/* Company & Status Info */}
              <div className="space-y-4">
                <div className="flex justify-between border-b border-vybe-glassBorder pb-2">
                  <span className="text-gray-400">Company</span>
                  <span className="font-medium text-white">{selectedOrder.company}</span>
                </div>
                <div className="flex justify-between border-b border-vybe-glassBorder pb-2">
                  <span className="text-gray-400">Contact</span>
                  <span className="font-medium text-white">{selectedOrder.contact}</span>
                </div>
                <div className="flex justify-between border-b border-vybe-glassBorder pb-2">
                  <span className="text-gray-400">Est. Quantity</span>
                  <span className="font-medium text-white">{selectedOrder.items} pieces</span>
                </div>
                <div className="flex justify-between border-b border-vybe-glassBorder pb-2">
                  <span className="text-gray-400">Total Value</span>
                  <span className="font-bold text-vybe-neon">₹{selectedOrder.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-vybe-glassBorder pb-2 items-center">
                  <span className="text-gray-400">Update Status</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateWholesaleStatus(selectedOrder.id, e.target.value)}
                    className="bg-vybe-dark border border-vybe-glassBorder rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-vybe-neon"
                  >
                    {WHOLESALE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.shippingAddress && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Delivery Warehouse</h3>
                  <div className="bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder">
                    <p className="text-gray-300 leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              )}

              {/* Order Manifest */}
              {selectedOrder.itemsList && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Order Manifest ({selectedOrder.items} Total Units)</h3>
                  <div className="space-y-2">
                    {selectedOrder.itemsList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-black" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Bulk Qty: {item.qty} • Rate: ₹{item.price}</p>
                        </div>
                        <div className="font-bold text-vybe-neon">
                          ₹{item.itemTotal ? item.itemTotal.toLocaleString() : (item.qty * item.price).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button variant="primary" fullWidth><Send className="w-4 h-4 mr-2" /> Send Quotation</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
