import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@entities/user';
import { setToken } from '@shared/api';

interface AuthState {
  token: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}

const isBrowser = typeof window !== 'undefined';

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
      storage: createJSONStorage(() => (isBrowser ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
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
