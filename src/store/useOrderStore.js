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

  updateOrderDetails: async (id, orderType, updateData) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const updatedOrder = await res.json();
      
      set((state) => {
        if (orderType === 'Retail') {
          return {
            retailOrders: state.retailOrders.map(o => o.id === id ? { ...o, ...updatedOrder, id: updatedOrder._id } : o)
          };
        } else if (orderType === 'Wholesale') {
          return {
            wholesaleOrders: state.wholesaleOrders.map(o => o.id === id ? { ...o, ...updatedOrder, id: updatedOrder._id } : o)
          };
        }
        return state;
      });
    } catch (error) {
      console.error(error);
    }
  },
}));
