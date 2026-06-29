import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Custom Modals State
  confirmModal: null, // { title, message, onConfirm, onCancel, confirmText, cancelText }
  alertModal: null, // { title, message, type: 'info' | 'success' | 'error' }
  
  confirm: (options) => set({ confirmModal: options }),
  closeConfirm: () => set({ confirmModal: null }),
  
  alert: (message, type = 'info', title) => set({ alertModal: { message, type, title } }),
  closeAlert: () => set({ alertModal: null }),
}));
