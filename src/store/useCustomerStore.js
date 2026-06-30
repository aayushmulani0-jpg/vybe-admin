import { create } from 'zustand';
import { API_URL } from '../config';

export const useCustomerStore = create((set) => ({
  customers: [],
  isLoading: false,

  fetchCustomersAndOrders: async () => {
    set({ isLoading: true });
    try {
      // Fetch both customers and all orders in parallel
      const [customersRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/auth/customers`),
        fetch(`${API_URL}/orders`) // Gets all orders since no type query param is passed
      ]);

      if (!customersRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const users = await customersRes.json();
      const allOrders = await ordersRes.json();

      // Aggregate data per user
      const aggregatedCustomers = users.map(user => {
        // Match orders by email
        const userOrders = allOrders.filter(order => order.email === user.email);
        
        const orderCount = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Flatten purchased items
        let purchasedItems = [];
        userOrders.forEach(order => {
          if (order.itemsList && order.itemsList.length > 0) {
            order.itemsList.forEach(item => {
              purchasedItems.push({
                ...item,
                orderId: order._id,
                orderDate: order.date,
                orderType: order.orderType
              });
            });
          }
        });

        // Determine Customer Type: > 2 orders means Repeat (or >= 2 if user meant "2 or more", the prompt said "more then 2 order", meaning > 2 or >= 2. Let's use >= 2 as standard practice for "Repeat", but > 1 is also valid. I will use >= 2 based on "more then 2 order" literal might mean >= 2)
        const type = orderCount >= 2 ? 'Repeat' : 'New';

        return {
          ...user,
          orderCount,
          totalSpent,
          purchasedItems,
          type
        };
      });

      set({ customers: aggregatedCustomers, isLoading: false });
    } catch (error) {
      console.error('Error fetching customers:', error);
      set({ isLoading: false });
    }
  }
}));
