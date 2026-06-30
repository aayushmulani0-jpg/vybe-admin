import { create } from 'zustand';
import { useUIStore } from './useUIStore';
import { API_URL as BASE_API_URL } from '../config';
const API_URL = `${BASE_API_URL}/catalogues`;

export const useCatalogueStore = create((set, get) => ({
  catalogues: [],
  isLoading: false,

  fetchCatalogues: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const formattedData = data.map(c => ({ ...c, id: c._id }));
      set({ catalogues: formattedData, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  createCatalogue: async (name) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, items: [], wholesaleLocations: [], wholesaleTemplates: [] }),
      });
      const newCat = await res.json();
      newCat.id = newCat._id;
      set((state) => ({ catalogues: [newCat, ...state.catalogues] }));
    } catch (error) {
      console.error(error);
    }
  },

  setLiveCatalogue: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/live`, { method: 'PUT' });
      const updatedCat = await res.json();
      set((state) => ({
        catalogues: state.catalogues.map(c => ({
          ...c,
          isLive: c.id === id
        }))
      }));
    } catch (error) {
      console.error(error);
    }
  },

  setOfflineCatalogue: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/offline`, { method: 'PUT' });
      const updatedCat = await res.json();
      set((state) => ({
        catalogues: state.catalogues.map(c => ({
          ...c,
          isLive: c.id === id ? false : c.isLive
        }))
      }));
    } catch (error) {
      console.error(error);
    }
  },

  deleteCatalogue: async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      set((state) => ({
        catalogues: state.catalogues.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error(error);
    }
  },

  // Helper to sync a catalogue update to the backend manually
  saveCatalogue: async (id) => {
    const cat = get().catalogues.find(c => c.id === id);
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      useUIStore.getState().alert('Catalogue saved successfully!', 'success', 'Saved');
    } catch (error) {
      console.error(error);
      useUIStore.getState().alert('Failed to save catalogue', 'error', 'Error');
    }
  },

  addCatalogueItem: (catalogueId, productId, basePrice) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { ...cat, items: [...cat.items, { productId, wholesalePrice: basePrice, moq: 10 }] };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },

  removeCatalogueItem: (catalogueId, productId) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { ...cat, items: cat.items.filter(i => i.productId !== productId && i.productId?._id !== productId) };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },

  updateCatalogueItem: (catalogueId, productId, updates) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { 
      ...cat, 
      items: cat.items.map(i => (i.productId === productId || i.productId?._id === productId) ? { ...i, ...updates } : i) 
    };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },

  updateWholesalePrintSettings: (catalogueId, locations, templates) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { 
      ...cat, 
      wholesaleLocations: locations,
      wholesaleTemplates: templates
    };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },
}));
