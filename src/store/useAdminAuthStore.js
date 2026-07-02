import { create } from 'zustand';
import { API_URL } from '../config';

export const useAdminAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('adminUser')) || null,
  token: localStorage.getItem('adminToken') || null,
  loading: false,
  error: null,
  hasAdmin: null,
  requiresOtp: false,
  tempToken: null,

  checkAdminExists: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/check-admin`);
      const data = await res.json();
      set({ hasAdmin: data.hasAdmin });
      return data.hasAdmin;
    } catch (err) {
      console.error('Error checking admin:', err);
      return false;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdminLogin: true }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.requiresOtp) {
        set({ requiresOtp: true, tempToken: data.tempToken, loading: false });
        return;
      }

      // Fallback for unexpected response
      throw new Error('Unexpected login flow');
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  verifyOtp: async (otp) => {
    set({ loading: true, error: null });
    try {
      const { tempToken } = useAdminAuthStore.getState();
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('adminUser', JSON.stringify(data));
      localStorage.setItem('adminToken', data.token);

      set({ user: data, token: data.token, loading: false, requiresOtp: false, tempToken: null });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  registerAdmin: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('adminUser', JSON.stringify(data));
      localStorage.setItem('adminToken', data.token);

      set({ user: data, token: data.token, loading: false, hasAdmin: true });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    const { token } = useAdminAuthStore.getState();
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    set({ user: null, token: null, requiresOtp: false, tempToken: null });
  },
}));
