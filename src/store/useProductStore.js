import { create } from 'zustand';

const API_URL = 'http://localhost:5000/api/products';

export const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Map MongoDB _id to id for frontend consistency
      const formattedData = data.map(p => ({ ...p, id: p._id }));
      set({ products: formattedData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const newProduct = await res.json();
      newProduct.id = newProduct._id;
      set((state) => ({ products: [newProduct, ...state.products] }));
    } catch (error) {
      console.error('Error adding product:', error);
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedProduct = await res.json();
      updatedProduct.id = updatedProduct._id;
      set((state) => ({
        products: state.products.map(p => p.id === id ? updatedProduct : p)
      }));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  },

  deleteProduct: async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  },

  toggleStock: async (id) => {
    const product = get().products.find(p => p.id === id);
    if (!product) return;
    const newStatus = product.stockStatus === 'In Stock' ? 'Out of Stock' : 'In Stock';
    await get().updateProduct(id, { stockStatus: newStatus });
  }
}));
