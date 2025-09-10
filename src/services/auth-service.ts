import api from '../lib/api';
import Cookies from 'js-cookie';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Shared cookie options
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  expires: 30 // 30 days
};

const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  expires: 1 // 1 day for access token
};

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', data);
    const { accessToken, refreshToken } = response.data;

    // Set tokens in cookies if they exist in response
    if (accessToken) {
      Cookies.set('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
    }
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const currentRefreshToken = Cookies.get('refreshToken');

    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', {}, {
      headers: {
        'RefreshToken': `Bearer ${currentRefreshToken}`
      }
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update cookies with new tokens
    if (accessToken) {
      Cookies.set('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
    }
    if (newRefreshToken) {
      Cookies.set('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    }

    return response.data;
  } catch (error: any) {
    // Clear cookies if refresh fails
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    throw new Error(error.response?.data?.message || 'Refresh token failed');
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate tokens on server
    await api.post('/auth/logout');
  } catch (error) {
    // Even if server logout fails, we should clear local tokens
    console.error('Server logout failed:', error);
  } finally {
    // Always clear local tokens
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post('/password/forgot', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Forgot password request failed');
  }
};

export const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post('/password/reset', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Password reset failed');
  }
};

// Check if user is authenticated (has valid tokens)
export const isAuthenticated = (): boolean => {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  return !!(accessToken || refreshToken);
};

// Get current access token
export const getAccessToken = (): string | undefined => {
  return Cookies.get('accessToken');
};

// Get current refresh token  
export const getRefreshToken = (): string | undefined => {
  return Cookies.get('refreshToken');
};