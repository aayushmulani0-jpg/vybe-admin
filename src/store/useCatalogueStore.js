import { create } from 'zustand';

const API_URL = 'http://localhost:5000/api/catalogues';

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
        body: JSON.stringify({ name, items: [], printPricing: [] }),
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
      alert('Catalogue saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save catalogue');
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

  addPrintPricing: (catalogueId, pricingObj) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { ...cat, printPricing: [...cat.printPricing, pricingObj] };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },

  removePrintPricing: (catalogueId, pricingId) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { ...cat, printPricing: cat.printPricing.filter(p => p._id !== pricingId && p.id !== pricingId) };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },

  updatePrintPricing: (catalogueId, pricingId, updates) => {
    const cat = get().catalogues.find(c => c.id === catalogueId);
    const updatedCat = { 
      ...cat, 
      printPricing: cat.printPricing.map(p => (p._id === pricingId || p.id === pricingId) ? { ...p, ...updates } : p) 
    };
    set(state => ({ catalogues: state.catalogues.map(c => c.id === catalogueId ? updatedCat : c) }));
  },
}));
