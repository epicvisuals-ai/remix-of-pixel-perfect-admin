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
  updateMe: (data: Partial<{ first_name: string; last_name: string; appearance: string }>) => 
    api.patch<UserProfile>('/users/me', data),
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

// Team member types
export interface TeamMember {
  id: string;
  role: string;
  user_id: string;
  status: string;
  email: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  joined_at: string;
}

export interface TeamMembersResponse {
  items: TeamMember[];
  next_cursor: string | null;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: string;
}

export interface InviteTeamMemberResponse {
  message: string;
  email: string;
  user_exists: boolean;
  status: string;
}

// Team API functions
export const teamApi = {
  getTeamMembers: () => api.get<TeamMembersResponse>('/team_members'),
  inviteTeamMember: (data: InviteTeamMemberRequest) =>
    api.post<InviteTeamMemberResponse>('/team_members/invite', data),
};

// Creator types
export interface SavedCreator {
  id: string;
  creatorId: string;
  avatar: string | null;
  name: string | null;
  specialty: string | null;
  rating: number | null;
  addedAt: string;
}

export interface WorkedWithCreator {
  id: string;
  creatorId: string;
  avatar: string | null;
  name: string | null;
  specialty: string | null;
  projectCount: number;
}

export interface ExploreCreator {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
  specialty: string;
  rating: number;
  isAvailable: boolean;
  avatar: string | null;
  portfolioImage: string | null;
  isFavorite: boolean | null;
}

export interface CreatorsAggregateResponse {
  success: boolean;
  data: {
    saved: SavedCreator[];
    workedWith: WorkedWithCreator[];
    explore: ExploreCreator[];
    counts: {
      saved: number;
      workedWith: number;
      explore: number;
    };
  };
}

// Creators API functions
export const creatorsApi = {
  getAggregate: () => api.get<CreatorsAggregateResponse>('/creators/aggregate'),
};
