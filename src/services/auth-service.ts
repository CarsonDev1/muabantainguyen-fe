import api from '../lib/api';

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

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// LocalStorage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Helper functions for localStorage operations
const setItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to set ${key} in localStorage:`, error);
  }
};

const getItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get ${key} from localStorage:`, error);
    return null;
  }
};

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
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

    // Set tokens in localStorage if they exist in response
    if (accessToken) {
      setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const currentRefreshToken = getItem(REFRESH_TOKEN_KEY);

    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', {}, {
      headers: {
        'RefreshToken': `Bearer ${currentRefreshToken}`
      }
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update localStorage with new tokens
    if (accessToken) {
      setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (newRefreshToken) {
      setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    }

    return response.data;
  } catch (error: any) {
    // Clear localStorage if refresh fails
    removeItem(ACCESS_TOKEN_KEY);
    removeItem(REFRESH_TOKEN_KEY);
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
    removeItem(ACCESS_TOKEN_KEY);
    removeItem(REFRESH_TOKEN_KEY);
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

export const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Change password failed');
  }
};

// Check if user is authenticated (has valid tokens)
export const isAuthenticated = (): boolean => {
  const accessToken = getItem(ACCESS_TOKEN_KEY);
  const refreshToken = getItem(REFRESH_TOKEN_KEY);
  return !!(accessToken || refreshToken);
};

// Get current access token
export const getAccessToken = (): string | null => {
  return getItem(ACCESS_TOKEN_KEY);
};

// Get current refresh token  
export const getRefreshToken = (): string | null => {
  return getItem(REFRESH_TOKEN_KEY);
};

// Clear all tokens from localStorage
export const clearTokens = (): void => {
  removeItem(ACCESS_TOKEN_KEY);
  removeItem(REFRESH_TOKEN_KEY);
};