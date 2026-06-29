import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { ShoppingCart, Eye, FileText, X, CheckCircle, Truck, Package, Clock, CreditCard, Search } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export default function RetailOrders() {
  const { retailOrders, updateOrderDetails, fetchOrders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { alert } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Editable fields for shipping
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

  const RETAIL_STATUSES = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
  const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Processing': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Shipped': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Cancelled': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIndex = (status) => {
    return RETAIL_STATUSES.indexOf(status);
  };

  const handleUpdateShipping = () => {
    updateOrderDetails(selectedOrder.id, 'Retail', { shippingDetails: editShipping });
    setSelectedOrder({ ...selectedOrder, shippingDetails: editShipping });
    alert('Tracking details updated.', 'success', 'Success');
  };

  const filteredOrders = retailOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesId = order.id?.toLowerCase().includes(query);
    const matchesCustomer = order.customer?.toLowerCase().includes(query);
    const matchesEmail = order.email?.toLowerCase().includes(query);
    return matchesId || matchesCustomer || matchesEmail;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Retail Orders</h1>
          <p className="text-sm text-gray-400">Manage individual consumer orders, payments, and shipping.</p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-vybe-neon transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4">{order.date || new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${order.paymentStatus === 'Paid' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-orange-400 bg-orange-500/10 border-orange-500/30'}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-vybe-neon">
                    ₹{order.total?.toLocaleString() || (order.itemsList ? order.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-vybe-glassBorder" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-vybe-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-vybe-glassBorder">
                      <ShoppingCart className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Retail Orders</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto">When customers purchase items from your storefront, they will appear here for processing.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modern Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1A1A1A] w-full max-w-4xl min-h-[80vh] border border-white/10 rounded-xl shadow-2xl relative flex flex-col my-8">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start sticky top-0 bg-[#1A1A1A] z-10 rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Placed on {selectedOrder.date}</span>
                  <span>•</span>
                  <span>{selectedOrder.items} Items</span>
                  <span>•</span>
                  <span className="font-semibold text-vybe-neon">Total: ₹{selectedOrder.total?.toLocaleString() || 0}</span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Timeline & Items */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Items List */}
                <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ordered Items</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {selectedOrder.itemsList && selectedOrder.itemsList.map((item, idx) => (
                      <div key={idx} className="p-4 flex gap-4">
                        <div className="w-20 h-20 bg-neutral-900 rounded-md border border-white/10 overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-white truncate pr-4">{item.name}</h4>
                            <span className="font-bold text-white">₹{item.price * item.qty}</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">₹{item.price} × {item.qty}</p>
                          
                          {/* Variants */}
                          {(item.selectedSize || item.selectedColor) && (
                            <div className="flex gap-3 mt-2 text-xs text-gray-400">
                              {item.selectedSize && <span className="bg-white/5 px-2 py-1 rounded">Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span className="bg-white/5 px-2 py-1 rounded flex items-center gap-1">Color: <span className="w-2 h-2 rounded-full inline-block border border-white/20" style={{backgroundColor: item.selectedColor.toLowerCase()}}></span>{item.selectedColor}</span>}
                            </div>
                          )}

                          {/* Custom Prints Detail */}
                          {item.selectedPrints && item.selectedPrints.length > 0 && (
                            <div className="mt-3 bg-neutral-900/50 p-2.5 rounded border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Print Configuration</p>
                              <div className="flex flex-wrap gap-2">
                                {item.selectedPrints.map((p, i) => (
                                  <span key={i} className="text-xs bg-vybe-neon/10 text-vybe-neon px-2 py-1 rounded border border-vybe-neon/20">
                                    {p.name} (+₹{p.cost})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Uploaded Designs Gallery */}
                          {item.uploadedImages && Object.keys(item.uploadedImages).length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Customer Designs</p>
                              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {Object.entries(item.uploadedImages).map(([zone, url]) => (
                                  <a key={zone} href={url} target="_blank" rel="noreferrer" className="block relative group flex-shrink-0">
                                    <div className="w-16 h-16 bg-neutral-900 border border-white/10 rounded overflow-hidden relative group-hover:border-vybe-neon transition-colors">
                                      <img src={url} alt={zone} className="w-full h-full object-cover group-hover:opacity-30 transition-all" />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-vybe-neon text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                          <Eye className="w-2 h-2" /> Open
                                        </span>
                                      </div>
                                    </div>
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                                      {zone}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Customer, Payment, Shipping */}
              <div className="space-y-6">
                
                {/* Customer Info */}
                <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Name</p>
                      <p className="font-medium text-white">{selectedOrder.customer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Email</p>
                      <p className="font-medium text-white">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Phone</p>
                      <p className="font-medium text-white">{selectedOrder.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Shipping Address</p>
                      <p className="font-medium text-white">{selectedOrder.shippingAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3 rounded-b-xl">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button variant="primary"><FileText className="w-4 h-4 mr-2" /> Download Invoice</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
