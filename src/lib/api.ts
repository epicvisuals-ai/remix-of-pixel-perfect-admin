import axios from 'axios';

export const API_BASE_URL = 'https://internal-api.epicvisuals.ai/v1.0';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Navigate to auth page
      if (window.location.pathname !== '/auth' && !window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API functions
export const authApi = {
  signin: (email: string) => 
    axios.post(`${API_BASE_URL}/signin`, { email }, {
      headers: { 'Content-Type': 'application/json' }
    }),
  
  confirmSignin: (email: string, token: string) =>
    axios.post(`${API_BASE_URL}/signin/confirm`, { email, token }, {
      headers: { 'Content-Type': 'application/json' }
    }),
};
