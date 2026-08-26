import { clientAuth } from './clientMock';
import type { User, LoginCredentials, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const result = clientAuth.login(credentials.email, credentials.password);
    if (!result) throw new Error('Invalid email or password');
    return result;
  },
  async logout(): Promise<void> {
    clientAuth.logout();
  },
  async getCurrentUser(): Promise<User | null> {
    return clientAuth.getUser();
  },
};
