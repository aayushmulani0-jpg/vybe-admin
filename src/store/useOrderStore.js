import { create } from 'zustand';

const API_URL = 'http://localhost:5000/api/orders';

export const useOrderStore = create((set, get) => ({
  retailOrders: [],
  wholesaleOrders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const [resRetail, resWholesale] = await Promise.all([
        fetch(`${API_URL}?type=Retail`),
        fetch(`${API_URL}?type=Wholesale`)
      ]);
      const retailData = await resRetail.json();
      const wholesaleData = await resWholesale.json();

      set({ 
        retailOrders: retailData.map(o => ({ ...o, id: o._id })),
        wholesaleOrders: wholesaleData.map(o => ({ ...o, id: o._id })),
        isLoading: false 
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  updateRetailStatus: async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      set((state) => ({
        retailOrders: state.retailOrders.map(o => o.id === id ? { ...o, status: newStatus } : o)
      }));
    } catch (error) {
      console.error(error);
    }
  },

  updateWholesaleStatus: async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      set((state) => ({
        wholesaleOrders: state.wholesaleOrders.map(o => o.id === id ? { ...o, status: newStatus } : o)
      }));
    } catch (error) {
      console.error(error);
    }
  },
}));
