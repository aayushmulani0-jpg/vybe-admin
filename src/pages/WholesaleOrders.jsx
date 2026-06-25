import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { Package, Eye, Send, X, CheckCircle, Truck, Clock, CreditCard, Building2, Download } from 'lucide-react';
import MockupViewer from '../components/custom-print/MockupViewer';

export default function WholesaleOrders() {
  const { wholesaleOrders, updateOrderDetails, fetchOrders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editShipping, setEditShipping] = useState({ courier: '', trackingNumber: '' });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (selectedOrder && selectedOrder.shippingDetails) {
      setEditShipping({
        courier: selectedOrder.shippingDetails.courier || '',
        trackingNumber: selectedOrder.shippingDetails.trackingNumber || ''
      });
    } else {
      setEditShipping({ courier: '', trackingNumber: '' });
    }
  }, [selectedOrder]);

  const WHOLESALE_STATUSES = ['Inquiry', 'Quotation Sent', 'Payment Pending', 'Production', 'Ready To Ship', 'Shipped', 'Delivered'];
  const PAYMENT_STATUSES = ['Pending', 'Advance Paid', 'Paid in Full', 'Failed'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Production': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Ready To Ship': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Shipped': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Quotation Sent': return 'text-vybe-neon bg-vybe-neon/10 border-vybe-neon/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIndex = (status) => {
    return Math.max(0, WHOLESALE_STATUSES.indexOf(status));
  };

  const handleUpdateShipping = () => {
    updateOrderDetails(selectedOrder.id, 'Wholesale', { shippingDetails: editShipping });
    setSelectedOrder({ ...selectedOrder, shippingDetails: editShipping });
    alert('Logistics details updated.');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Wholesale & B2B Orders</h1>
          <p className="text-sm text-gray-400">Manage bulk inquiries, quotes, production tracking, and B2B logistics.</p>
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
                <th className="px-6 py-4">Est. Qty</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wholesaleOrders.map((order) => (
                <tr key={order.id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4">{order.date || new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold">{order.company || order.customer}</td>
                  <td className="px-6 py-4">{order.itemsList ? order.itemsList.reduce((sum, item) => sum + item.qty, 0) : order.items || order.quantity || 1}</td>
                  <td className="px-6 py-4 font-bold text-vybe-neon">
                    ₹{order.total?.toLocaleString() || (order.itemsList ? order.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-20 pb-10 custom-scrollbar">
          <GlassCard className="w-full max-w-4xl p-6 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-white">B2B Order: {selectedOrder.id.slice(-8).toUpperCase()}</h2>
              <span className="bg-vybe-neon/10 text-vybe-neon border border-vybe-neon/30 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Wholesale</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visualizer Component */}
              <MockupViewer order={selectedOrder} />

              {/* Order Metadata & Actions */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Company</span>
                    <span className="font-medium text-white">{selectedOrder.company || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Contact</span>
                    <span className="font-medium text-white">{selectedOrder.customer || selectedOrder.contact}</span>
                  </div>
                  {selectedOrder.email && (
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-white">{selectedOrder.email}</span>
                    </div>
                  )}
                  {selectedOrder.phone && (
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Phone</span>
                      <span className="font-medium text-white">{selectedOrder.phone}</span>
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Shipping</span>
                      <span className="font-medium text-white text-right max-w-[200px] break-words">{selectedOrder.shippingAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Print Areas</span>
                    <span className="font-medium text-white text-right max-w-[200px] break-words">
                      {selectedOrder.itemsList?.[0]?.selectedPrints?.map(p => p.name).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Quoted Value</span>
                    <span className="font-bold text-vybe-neon">₹{selectedOrder.total?.toLocaleString() || (selectedOrder.itemsList ? selectedOrder.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : 0).toLocaleString()}</span>
                  </div>

                  {selectedOrder.itemsList && selectedOrder.itemsList.length > 0 && (
                    <div className="pt-4 border-t border-vybe-glassBorder">
                      <span className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Item Breakdown</span>
                      <div className="space-y-2">
                        {selectedOrder.itemsList.map((item, idx) => (
                          <div key={idx} className="bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder text-xs flex flex-col gap-2">
                            <div className="flex justify-between">
                              <span className="text-white font-medium">{item.name}</span>
                              <span className="text-white font-bold">₹{(item.itemTotal || (item.price * item.qty)).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-400 flex justify-between">
                              <span>Bulk Qty: {item.qty} | Size: {item.selectedSize || 'N/A'}</span>
                              <span>₹{item.price}/unit</span>
                            </div>
                            
                            {item.selectedPrints && item.selectedPrints.length > 0 && (
                              <div className="mt-1 pt-2 border-t border-vybe-glassBorder">
                                <span className="text-gray-500 font-semibold mb-1 block uppercase">Customizations:</span>
                                <div className="flex flex-wrap gap-2">
                                  {item.selectedPrints.map((p, i) => (
                                    <span key={i} className="text-[10px] bg-vybe-neon/10 text-vybe-neon px-2 py-0.5 rounded border border-vybe-neon/20">
                                      {p.name} (+₹{p.cost}/unit)
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.uploadedImages && Object.keys(item.uploadedImages).length > 0 && (
                              <div className="mt-1 pt-2 border-t border-vybe-glassBorder">
                                <span className="text-gray-500 font-semibold mb-1 block uppercase">Attached Files:</span>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(item.uploadedImages).map(([zone, url]) => (
                                    <a 
                                      key={zone} 
                                      href={url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="group flex flex-col items-center gap-1 bg-vybe-dark border border-vybe-glassBorder p-1.5 rounded hover:border-vybe-neon transition-colors"
                                    >
                                      <div className="relative w-12 h-12 rounded overflow-hidden">
                                        <img src={url} alt={zone} className="w-full h-full object-cover opacity-80 group-hover:opacity-30 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <span className="bg-vybe-neon text-black text-[8px] font-bold px-1 py-0.5 rounded uppercase">
                                            Open
                                          </span>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-gray-400 group-hover:text-vybe-neon truncate max-w-full font-semibold">{zone}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <div className="mt-4 bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-orange-300">
                      <strong className="block text-xs uppercase mb-1">Client Note:</strong>
                      {selectedOrder.notes}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-6 border-t border-vybe-glassBorder">
                  <Button variant="primary" fullWidth className="justify-center">
                    <Send className="w-4 h-4 mr-2" /> Send Official Quote / Invoice
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => setSelectedOrder(null)}>Close Window</Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
