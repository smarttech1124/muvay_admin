import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AdminUser } from '@/types';

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
  setAuth: (admin: AdminUser, token: string) => void;
  clearAuth: () => void;
  updateActivity: () => void;
  updateAdmin: (data: Partial<AdminUser>) => void;
}

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      lastActivity: Date.now(),

      setAuth: (admin, token) => {
        Cookies.set('muvay_admin_token', token, { expires: 1, sameSite: 'strict', secure: true });
        set({ admin, token, isAuthenticated: true, lastActivity: Date.now() });
      },

      clearAuth: () => {
        Cookies.remove('muvay_admin_token');
        set({ admin: null, token: null, isAuthenticated: false });
      },

      updateActivity: () => {
        const { lastActivity, clearAuth } = get();
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
          clearAuth();
          if (typeof window !== 'undefined') window.location.replace('/login');
          return;
        }
        set({ lastActivity: Date.now() });
      },

      updateAdmin: (data) =>
        set(s => ({ admin: s.admin ? { ...s.admin, ...data } : null })),
    }),
    {
      name: 'muvay-admin-auth',
      partialize: (s) => ({ admin: s.admin, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);
