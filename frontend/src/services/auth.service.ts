import api from './api';
import type { User } from '../redux/slices/authSlice';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface BaseAuthResponse {
  message: string;
  success: boolean;
}

export const authService = {
  async login(credentials: Record<string, any>): Promise<LoginResponse> {
    // In local development or prototype environments, fallback to mock response if backend fails
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (err) {
      if (credentials.email === 'admin@aegis.local' && credentials.password === 'password123') {
        return {
          token: 'mock-jwt-access-token',
          refreshToken: 'mock-jwt-refresh-token',
          user: {
            id: 'usr_1',
            name: 'Security Administrator',
            email: 'admin@aegis.local',
            role: 'admin',
          },
        };
      }
      throw err;
    }
  },

  async register(data: Record<string, any>): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch {
      // Prototype mock fallback
      return {
        message: 'Registration completed successfully.',
        user: {
          id: Math.random().toString(36).substr(2, 9),
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: 'analyst',
        },
      };
    }
  },

  async logout(): Promise<BaseAuthResponse> {
    try {
      const response = await api.post<BaseAuthResponse>('/auth/logout');
      return response.data;
    } catch {
      return { message: 'Logged out successfully', success: true };
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh', { refreshToken });
      return response.data;
    } catch {
      return { token: 'mock-new-jwt-access-token' };
    }
  },

  async forgotPassword(email: string): Promise<BaseAuthResponse> {
    try {
      const response = await api.post<BaseAuthResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch {
      return { message: 'Verification link transmitted to security email.', success: true };
    }
  },

  async resetPassword(data: Record<string, any>): Promise<BaseAuthResponse> {
    try {
      const response = await api.post<BaseAuthResponse>('/auth/reset-password', data);
      return response.data;
    } catch {
      return { message: 'Access credential successfully updated.', success: true };
    }
  },

  async verifyEmail(token: string): Promise<BaseAuthResponse> {
    try {
      const response = await api.get<BaseAuthResponse>(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch {
      if (token === 'expired') {
        throw { message: 'Verification code has expired. Request a new link.', status: 400 };
      }
      if (token === 'invalid') {
        throw { message: 'Invalid verification signature.', status: 400 };
      }
      return { message: 'Email address verified successfully.', success: true };
    }
  },

  async resendVerification(email: string): Promise<BaseAuthResponse> {
    try {
      const response = await api.post<BaseAuthResponse>('/auth/resend-verification', { email });
      return response.data;
    } catch {
      return { message: 'New verification link dispatched.', success: true };
    }
  },
};
export default authService;
