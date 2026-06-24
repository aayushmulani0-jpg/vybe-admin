import { create } from 'zustand';

const API_URL = 'http://localhost:5000/api/orders';

export const useCustomPrintStore = create((set) => ({
  customOrders: [],
  isLoading: false,

  fetchCustomOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}?type=CustomPrint`);
      const data = await res.json();
      set({ 
        customOrders: data.map(o => ({ ...o, id: o._id })),
        isLoading: false 
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      set((state) => ({
        customOrders: state.customOrders.map(o => o.id === id ? { ...o, status: newStatus } : o)
      }));
    } catch (error) {
      console.error(error);
    }
  },
}));
