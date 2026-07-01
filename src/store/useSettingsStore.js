import { create } from 'zustand';
import { API_URL } from '../config';

export const useSettingsStore = create((set) => ({
  settings: null,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      if (data.success) {
        set({ settings: data.settings });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      const token = localStorage.getItem('vybe-admin-token');
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        set({ settings: data.settings });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return false;
    }
  }
}));
