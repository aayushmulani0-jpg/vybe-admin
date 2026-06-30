import { create } from 'zustand';
import { API_URL } from '../config';

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

  addLocation: async (locationData) => {
    try {
      const res = await fetch(`${API_URL}/print-locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData),
      });
      if (res.ok) {
        const added = await res.json();
        set(state => ({
          printLocations: [...state.printLocations, added]
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add print location:', error);
      return false;
    }
  },

  deleteLocation: async (id) => {
    try {
      const res = await fetch(`${API_URL}/print-locations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        set(state => ({
          printLocations: state.printLocations.filter(loc => loc._id !== id)
        }));
      }
    } catch (error) {
      console.error('Failed to delete print location:', error);
    }
  }
}));
