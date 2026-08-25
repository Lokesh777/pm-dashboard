import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem('auth-user');
  const storedToken = localStorage.getItem('auth-token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!(storedUser && storedToken),
    setAuth: (user, token) => {
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    clearAuth: () => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
