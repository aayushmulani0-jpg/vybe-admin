import { useState, useEffect } from 'react';
import { useCustomPrintStore } from '../store/useCustomPrintStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import MockupViewer from '../components/custom-print/MockupViewer';
import { Palette, Eye, Download, X, Settings, Search, Save } from 'lucide-react';
import PrintSettings from './PrintSettings';
import { useSettingsStore } from '../store/useSettingsStore';

export default function CustomPrint() {
  const { customOrders, updateOrderStatus, fetchCustomOrders } = useCustomPrintStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeText, setNoticeText] = useState('');

  useEffect(() => {
    fetchCustomOrders();
    fetchSettings();
  }, [fetchCustomOrders, fetchSettings]);

  useEffect(() => {
    if (settings && settings.general) {
      setNoticeText(settings.general.customPrintNotice || '');
    }
  }, [settings]);

  const handleSaveNotice = async () => {
    setIsSavingNotice(true);
    await updateSettings({
      general: {
        ...settings.general,
        customPrintNotice: noticeText
      }
    });
    setIsSavingNotice(false);
  };

  const CUSTOM_STATUSES = ['New Order', 'Printing', 'Completed'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Printing': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'New Order': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const filteredOrders = customOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesId = order.id?.toLowerCase().includes(query);
    const matchesCustomer = order.customer?.toLowerCase().includes(query);
    return matchesId || matchesCustomer;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Custom Print Orders</h1>
          <p className="text-sm text-gray-400">View customer designs, update printing statuses, and download production files.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-vybe-neon transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Print Areas
          </Button>
        </div>
      </div>

      {/* Notice Editor */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Storefront Notice</h3>
        <p className="text-xs text-gray-400 mb-3">Add a note to display at the top of the Custom Print page for your users (e.g. "We are currently out of large size shirts" or "Please expect 3-day delays for custom prints").</p>
        <div className="flex items-start gap-4">
          <textarea
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="Enter notice text here... (leave blank to hide)"
            className="flex-1 bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-vybe-neon transition-colors resize-none"
            rows={2}
          />
          <Button onClick={handleSaveNotice} disabled={isSavingNotice}>
            <Save className="w-4 h-4 mr-2" />
            {isSavingNotice ? 'Saving...' : 'Save Notice'}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-vybe-dark text-xs uppercase text-gray-400 border-b border-vybe-glassBorder">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-vybe-glassBorder/50 hover:bg-vybe-glass/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4">{order.date || new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">
                    {order.itemsList ? order.itemsList.reduce((sum, item) => sum + item.qty, 0) : order.quantity || 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-vybe-neon">
                    ₹{order.total?.toLocaleString() || (order.itemsList ? order.itemsList.reduce((sum, item) => sum + (item.itemTotal || (item.price * item.qty)), 0) : (order.quantity * order.price)).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-vybe-glassBorder" 
                        title="View Print Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-vybe-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-vybe-glassBorder">
                      <Palette className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Custom Print Orders</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto">When users upload their own SVGs and create custom garments, they will queue up here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Custom Print Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-20 pb-10 custom-scrollbar">
          <GlassCard className="w-full max-w-4xl p-6 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Production Sheet: {selectedOrder.id}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visualizer Component */}
              <MockupViewer order={selectedOrder} />

              {/* Order Metadata & Actions */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Customer</span>
                    <span className="font-medium text-white">{selectedOrder.customer}</span>
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
                    <span className="text-gray-400">Total Value</span>
                    <span className="font-bold text-vybe-neon">₹{selectedOrder.total?.toLocaleString() || (selectedOrder.quantity * selectedOrder.price).toLocaleString()}</span>
                  </div>

                  {selectedOrder.itemsList && selectedOrder.itemsList.length > 0 && (
                    <div className="pt-4 border-t border-vybe-glassBorder">
                      <span className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Item Breakdown</span>
                      <div className="space-y-2">
                        {selectedOrder.itemsList.map((item, idx) => (
                          <div key={idx} className="bg-vybe-dark p-3 rounded-lg border border-vybe-glassBorder text-xs flex flex-col gap-2">
                            <div className="flex justify-between">
                              <span className="text-white font-medium">{item.name}</span>
                              <span className="text-white font-bold">₹{item.itemTotal?.toLocaleString()}</span>
                            </div>
                            <div className="text-gray-400 flex justify-between">
                              <span>Qty: {item.qty} | Size: {item.selectedSize || 'N/A'}</span>
                              <span>Base: ₹{item.price} + Print: ₹{item.selectedPrints?.reduce((sum, p) => sum + (Number(p.cost) || 0), 0) || 0}</span>
                            </div>
                            <div className="text-gray-400 flex justify-between items-center mt-1 pt-2 border-t border-vybe-glassBorder">
                              <span>Color: {item.selectedColor || 'Black'}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: item.selectedColorHex || '#000000' }}></div>
                                <span className="font-mono text-vybe-neon text-[10px] uppercase">{item.selectedColorHex || '#000000'}</span>
                              </div>
                            </div>
                            <div className="mt-1 pt-2 border-t border-vybe-glassBorder">
                              <strong className="block text-[10px] uppercase text-gray-500 mb-1">Printing Instructions:</strong>
                              <p className="text-gray-300 italic whitespace-pre-wrap">{item.printingInstructions || 'None provided'}</p>
                            </div>
                            {item.uploadedImages && Object.keys(item.uploadedImages).length > 0 && (
                              <div className="mt-1 pt-2 border-t border-vybe-glassBorder">
                                <span className="text-gray-500 font-semibold mb-1 block uppercase">Uploaded Designs:</span>
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
                  {/* Status dropdown removed */}

                  {selectedOrder.notes && (
                    <div className="mt-4 bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-orange-300">
                      <strong className="block text-xs uppercase mb-1">Customer Note:</strong>
                      {selectedOrder.notes}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-6 border-t border-vybe-glassBorder">
                  {selectedOrder.designUrl && (
                    <a 
                      href={selectedOrder.designUrl} 
                      download="customer_design.svg" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex"
                    >
                      <Button variant="primary" fullWidth className="justify-between">
                        <span>Download User Design</span>
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button variant="secondary" fullWidth onClick={() => setSelectedOrder(null)}>Close Window</Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Print Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-4xl relative">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <PrintSettings />
          </div>
        </div>
      )}
    </div>
  );
}
