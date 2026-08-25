import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginCredentials } from '../types';

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.login(credentials);
        setAuth(response.user, response.token);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      clearAuth();
      setLoading(false);
    }
  }, [clearAuth]);

  return { user, isAuthenticated, loading, error, login, logout };
}
