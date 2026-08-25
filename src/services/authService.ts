import type { User, LoginCredentials, AuthResponse } from '../types';

const MOCK_USER: User = {
  id: '1',
  name: 'Lokesh',
  email: 'lokesh@example.com',
};

const MOCK_PASSWORD = 'password123';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);

    if (
      credentials.email === MOCK_USER.email &&
      credentials.password === MOCK_PASSWORD
    ) {
      const token = `mock-jwt-${Date.now()}`;
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-user', JSON.stringify(MOCK_USER));
      return { user: MOCK_USER, token };
    }

    throw new Error('Invalid email or password');
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    const userStr = localStorage.getItem('auth-user');
    const token = localStorage.getItem('auth-token');
    if (userStr && token) {
      return JSON.parse(userStr) as User;
    }
    return null;
  },
};
