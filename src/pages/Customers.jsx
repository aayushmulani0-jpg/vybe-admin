import { useState, useEffect } from 'react';
import { useCustomerStore } from '../store/useCustomerStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { Users, Eye, X, Mail, ShoppingBag, TrendingUp, Calendar, MapPin, Tag } from 'lucide-react';

export default function Customers() {
  const { customers, isLoading, fetchCustomersAndOrders } = useCustomerStore();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomersAndOrders();
  }, [fetchCustomersAndOrders]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Customers</h1>
          <p className="text-sm text-gray-400">View registered users, order history, and lifetime value.</p>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Total Orders</th>
                  <th className="px-6 py-4">Lifetime Spent</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4 font-semibold text-white">{customer.orderCount}</td>
                    <td className="px-6 py-4 font-bold text-vybe-neon">₹{customer.totalSpent?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${customer.type === 'Repeat' ? 'text-vybe-neon bg-vybe-neon/10 border-vybe-neon/30' : 'text-blue-400 bg-blue-500/10 border-blue-500/30'}`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-vybe-glassBorder" 
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-vybe-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-vybe-glassBorder">
                        <Users className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">No Customers Yet</h3>
                      <p className="text-sm text-gray-400 max-w-sm mx-auto">When users register on your storefront, they will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Full Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] w-full max-w-5xl h-[90vh] border border-white/10 rounded-xl shadow-2xl relative flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#1A1A1A] z-10 rounded-t-xl shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-vybe-neon/20 to-purple-500/20 border border-vybe-neon/50 rounded-full flex items-center justify-center text-xl font-bold text-white uppercase shadow-[0_0_15px_rgba(204,255,0,0.15)]">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedCustomer.type === 'Repeat' ? 'text-vybe-neon bg-vybe-neon/10 border-vybe-neon/30' : 'text-blue-400 bg-blue-500/10 border-blue-500/30'}`}>
                      {selectedCustomer.type} Customer
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Contact & Stats */}
              <div className="space-y-6">
                
                {/* Stats Summary */}
                <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Value</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">Total Orders</p>
                      <p className="font-bold text-xl text-white">{selectedCustomer.orderCount}</p>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">Lifetime Spent</p>
                      <p className="font-bold text-xl text-vybe-neon">₹{selectedCustomer.totalSpent?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-white break-all">{selectedCustomer.email}</p>
                        <p className="text-xs text-gray-500">Primary Email</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Addresses */}
                <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Saved Addresses ({selectedCustomer.addresses?.length || 0})</h3>
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.addresses.map((addr, i) => (
                        <div key={i} className="bg-white/[0.02] p-3 rounded border border-white/5 text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-white flex items-center gap-1.5"><MapPin className="w-3 h-3 text-vybe-neon" /> {addr.label || 'Home'}</span>
                            {addr.isDefault && <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded uppercase">Default</span>}
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No saved addresses.</p>
                  )}
                </div>

              </div>

              {/* Right Column: Ordered Items Ledger */}
              <div className="lg:col-span-2">
                <div className="bg-black/20 rounded-lg border border-white/5 h-full flex flex-col">
                  <div className="p-5 border-b border-white/5 flex items-center gap-2 shrink-0">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-white">Purchase Ledger</h3>
                  </div>
                  
                  <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                    {selectedCustomer.purchasedItems && selectedCustomer.purchasedItems.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCustomer.purchasedItems.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                            <div className="w-20 h-20 bg-neutral-900 rounded border border-white/10 overflow-hidden flex-shrink-0">
                              <img 
                                src={item.image || 'https://via.placeholder.com/150'} 
                                alt={item.name} 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-white text-base truncate">{item.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/5">Order: #{item.orderId?.slice(-6).toUpperCase()}</span>
                                    <span className="text-[10px] text-gray-500">{item.orderDate}</span>
                                    {item.orderType && (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                        item.orderType === 'Wholesale' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                                        item.orderType === 'CustomPrint' ? 'text-purple-400 bg-purple-500/10 border-purple-500/30' :
                                        'text-vybe-neon bg-vybe-neon/10 border-vybe-neon/30'
                                      }`}>
                                        {item.orderType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-white text-lg ml-2">₹{(item.itemTotal || (item.price * item.qty)).toLocaleString()}</span>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                <span>Qty: <span className="text-white font-medium">{item.qty}</span> @ ₹{item.price}</span>
                                {(item.selectedSize || item.selectedColor) && (
                                  <>
                                    <span className="text-white/20">|</span>
                                    {item.selectedSize && <span>Size: <span className="text-white font-medium">{item.selectedSize}</span></span>}
                                    {item.selectedColor && (
                                      <span className="flex items-center gap-1">Color: 
                                        <span className="w-3 h-3 rounded-full border border-white/20 inline-block ml-1" style={{backgroundColor: item.selectedColor.toLowerCase()}}></span>
                                        <span className="text-white font-medium">{item.selectedColor}</span>
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Selected Prints */}
                              {item.selectedPrints && item.selectedPrints.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Tag className="w-3 h-3 text-gray-500" />
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Customizations</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {item.selectedPrints.map((p, i) => (
                                      <span key={i} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/10">
                                        {p.name} <span className="text-gray-500 ml-1">(+₹{p.cost})</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                        <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                        <p>This customer hasn't purchased anything yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
