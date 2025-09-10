import axios from 'axios';
import Cookies from 'js-cookie';

// Sử dụng domain mới với HTTPS
export const API_BASE_URL = 'http://localhost:4000/api';

// Create an axios instance with custom config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');

    // Add token to headers if exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (refreshToken) {
      config.headers.RefreshToken = `Bearer ${refreshToken}`;
    }

    // Special handling for FormData (don't set Content-Type as axios will set it with boundary)
    if (config.data instanceof FormData) {
      // Let the browser set the correct content type with boundary for multipart/form-data
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and auto refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');

      if (!refreshToken) {
        // No refresh token available, redirect to login
        console.log('No refresh token available. Redirecting to login...');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        // Dispatch custom event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));

        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            'RefreshToken': `Bearer ${refreshToken}`,
            'Content-Type': 'application/json'
          }
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Update cookies with new tokens
        const COOKIE_OPTIONS = {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          expires: 30
        };

        Cookies.set('accessToken', newAccessToken, COOKIE_OPTIONS);
        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, COOKIE_OPTIONS);
        }

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.log('Token refresh failed. Redirecting to login...');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        // Dispatch custom event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));

        processQueue(refreshError, null);
        isRefreshing = false;

        return Promise.reject(refreshError);
      }
    }

    // Handle other error scenarios
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with non-2xx status
      const { status, data } = error.response;
      console.log(`Error ${status}:`, data);
    } else if (error.request) {
      // Request made but no response received
      console.log('Network error. No response received.');
    } else {
      // Error in request setup
      console.log('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;