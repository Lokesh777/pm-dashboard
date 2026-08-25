import api from '../api/axios';
import type { User, LoginCredentials, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('auth-token', data.token);
    localStorage.setItem('auth-user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },
};
