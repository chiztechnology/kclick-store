import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: 'customer' | 'store_manager' | 'admin';
  store_id?: string;
  address: string;
  city: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export const authService = {
  getSession: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { data: null, error: null };
    }
    return apiClient.get<AuthResponse>('/auth/session');
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    const result = await apiClient.post<AuthResponse>('/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    if (result.data?.session) {
      localStorage.setItem('auth_token', result.data.session.access_token);
    }
    return result;
  },

  signIn: async (email: string, password: string) => {
    const result = await apiClient.post<AuthResponse>('/auth/signin', {
      email,
      password,
    });
    if (result.data?.session) {
      localStorage.setItem('auth_token', result.data.session.access_token);
    }
    return result;
  },

  signInWithPhone: async (phone: string) => {
    return apiClient.post<{ message: string }>('/auth/otp/send', { phone });
  },

  verifyOTP: async (phone: string, token: string) => {
    const result = await apiClient.post<AuthResponse>('/auth/otp/verify', {
      phone,
      token,
    });
    if (result.data?.session) {
      localStorage.setItem('auth_token', result.data.session.access_token);
    }
    return result;
  },

  signInWithOAuth: async (provider: 'google' | 'apple') => {
    return apiClient.post<{ url: string }>('/auth/oauth', {
      provider,
      redirect_to: window.location.origin,
    });
  },

  signOut: async () => {
    const result = await apiClient.post<void>('/auth/signout', {});
    localStorage.removeItem('auth_token');
    return result;
  },

  getProfile: async (userId: string) => {
    return apiClient.get<Profile>(`/auth/profile`);
  },

  updateProfile: async (updates: Partial<Profile>) => {
    return apiClient.patch<Profile>('/auth/profile', updates);
  },

  resetPassword: async (email: string, newPassword?: string) => {
    if (newPassword) {
      return apiClient.post<void>('/auth/reset-password', { email, new_password: newPassword });
    }
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return { data: null, error: { message: 'No refresh token', code: 'NO_REFRESH_TOKEN' } };
    }
    const result = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    if (result.data?.session) {
      localStorage.setItem('auth_token', result.data.session.access_token);
      localStorage.setItem('refresh_token', result.data.session.refresh_token);
    }
    return result;
  },
};
