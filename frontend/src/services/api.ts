import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/env';

// Standardized API error format
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

// Create the axios instance
const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const response = error.response;

    // Standardized API error handling
    const formattedError: ApiError = {
      message: 'An unexpected network error occurred.',
      status: response?.status,
    };

    if (response) {
      const responseData = response.data as Record<string, any>;
      formattedError.message = responseData?.message || responseData?.error || formattedError.message;
      formattedError.code = responseData?.code;
      formattedError.details = responseData?.details;

      // Handle 401 Unauthorized (token expired) - Future Token Refresh Placeholder
      if (response.status === 401 && originalRequest && !originalRequest.headers.get('X-Retry')) {
        originalRequest.headers.set('X-Retry', 'true');
        
        try {
          // Placeholder token refresh logic:
          // const newToken = await refreshSessionToken();
          // localStorage.setItem('token', newToken);
          // originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // return api(originalRequest);
        } catch {
          // Logout user if session refresh fails
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      formattedError.message = 'No response was received from the server. Check your network connection.';
    }

    return Promise.reject(formattedError);
  }
);

export default api;
