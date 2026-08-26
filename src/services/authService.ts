import api from '../api/axios';
import { clientAuth } from './clientMock';
import type { User, LoginCredentials, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      localStorage.setItem('auth-token', data.token);
      localStorage.setItem('auth-user', JSON.stringify(data.user));
      return data;
    } catch {
      const result = clientAuth.login(credentials.email, credentials.password);
      if (!result) throw new Error('Invalid email or password');
      return result;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    clientAuth.logout();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      return data.user;
    } catch {
      return clientAuth.getUser();
    }
  },
};
