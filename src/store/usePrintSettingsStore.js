import { create } from 'zustand';
const API_URL = 'http://localhost:5000/api';

export const usePrintSettingsStore = create((set, get) => ({
  printLocations: [],
  loading: false,

  fetchPrintLocations: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/print-locations`);
      const data = await res.json();
      set({ printLocations: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch print locations:', error);
      set({ loading: false });
    }
  },

  updateLocation: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/print-locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          printLocations: state.printLocations.map(loc => loc._id === id ? updated : loc)
        }));
      }
    } catch (error) {
      console.error('Failed to update print location:', error);
    }
  },
}));
