import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@entities/user';
import { setToken } from '@shared/api';

interface AuthState {
  token: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      setSession: (user, token) => {
        setToken(token);
        set({ token, currentUser: user, isAuthenticated: true });
      },
      logout: () => {
        setToken(null);
        set({ token: null, currentUser: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
        }
      },
    },
  ),
);
