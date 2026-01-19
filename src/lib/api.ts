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

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  default_account_id: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  role: string | null;
}

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

// User API functions
export const userApi = {
  getMe: () => api.get<UserProfile>('/users/me'),
};

// Onboarding response type
export interface OnboardingResponse {
  onboarding_step: number;
  onboarding_completed: boolean;
}

// Onboarding step 2 request type
export interface OnboardingStep2Request {
  first_name: string;
  last_name: string;
  company_name: string;
  role: string;
}

// Onboarding API functions
export const onboardingApi = {
  step1: () => api.post<OnboardingResponse>('/onboarding/step-1'),
  step2: (data: OnboardingStep2Request) => api.post<OnboardingResponse>('/onboarding/step-2', data),
  step3: () => api.post<OnboardingResponse>('/onboarding/step-3'),
};
