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

// Google SSO types
export interface GoogleSSORequest {
  code?: string;
  id_token?: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
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

  googleLogin: (payload: GoogleSSORequest) =>
    axios.post<AuthTokenResponse>(`${API_BASE_URL}/auth/google`, payload, {
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

export interface CreateRequestPayload {
  contentType: 'image' | 'video';
  brief: string;
  toneOfVoice: string;
  budget: number;
  deadline: string | null;
}

export interface ApproveRequestResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    statusChangedAt: string;
  };
}

export interface RejectRequestResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    statusChangedAt: string;
  };
}

export interface RequestMessageAttachment {
  id: string;
  fileName: string;
  url: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
}

export interface RequestMessageCreateResponse {
  success: boolean;
  data: {
    id: string;
    requestId: string;
    content: string;
    sentAt: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    attachments: RequestMessageAttachment[];
  };
}

export const requestApi = {
  createRequest: (data: CreateRequestPayload) => api.post('/requests', data),
  submitRequest: (requestId: string) => api.post(`/requests/${requestId}/submit`),
  deleteRequest: (requestId: string) => api.delete(`/requests/${requestId}`),
  approveRequest: (requestId: string) =>
    api.post<ApproveRequestResponse>(`/requests/${requestId}/approve`),
  rejectRequest: (requestId: string) =>
    api.post<RejectRequestResponse>(`/requests/${requestId}/reject`),
  sendMessage: (requestId: string, content: string | null, files: File[] | null) => {
    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    return api.post<RequestMessageCreateResponse>(`/requests/${requestId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Creator types
export interface SavedCreator {
  id: string;
  userId: string;
  creatorId: string;
  avatar: string | null;
  name: string | null;
  specialty: string | null;
  rating: number | null;
  addedAt: string;
}

export interface WorkedWithCreator {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  avatar: string | null;
  specialty: string | null;
  collaborationCount: number;
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

// Creator detail response types
export interface CreatorPortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  displayOrder: number;
  isFeatured: boolean;
}

export interface CreatorDetailResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    };
    specialty: string;
    bio: string;
    location: string;
    memberSince: string;
    rating: number;
    reviewCount: number;
    projectsCompleted: number;
    repeatClients: number;
    avgResponseTimeMinutes: number;
    isAvailable: boolean;
    avatar: string | null;
    coverImage: string | null;
    isFavorite: boolean;
    skills: string[];
    portfolio: CreatorPortfolioItem[];
    recentReviews: any[];
  };
}

// Creators API functions
export const creatorsApi = {
  getAggregate: (q?: string) => api.get<CreatorsAggregateResponse>('/creators/aggregate', { params: q ? { q } : {} }),
  getById: (creatorId: string) => api.get<CreatorDetailResponse>(`/creators/${creatorId}`),
};

// Favorites types
export interface AddFavoriteResponse {
  success: boolean;
  data: {
    id: string;
    creatorId: string;
    addedAt: string;
  };
}

export interface RemoveFavoriteResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Favorites API functions
export const favoritesApi = {
  add: (creatorId: string) =>
    api.post<AddFavoriteResponse>('/favorites', { creator_id: creatorId }),
  remove: (userId: string) =>
    api.delete<RemoveFavoriteResponse>(`/favorites/${userId}`),
};

// Creator Request types
export interface CreatorRequestItem {
  id: string;
  contentType: string;
  brief: string;
  toneOfVoice: string;
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  deliverables?: Array<{
    id: string;
    name: string;
    description?: string;
    dueDate?: string | null;
    status: string;
    submittedAt?: string | null;
    approvedAt?: string | null;
    revisionFeedback?: string | null;
    approvedBy?: any | null;
    files: Array<{
      id: string;
      fileName: string;
      fileType: string;
      mimeType: string;
      fileSize: number;
      url: string;
      thumbnailUrl?: string | null;
      uploadedBy: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
      };
      createdAt: string;
    }>;
  }>;
}

export interface CreatorRequestsResponse {
  success: boolean;
  data: CreatorRequestItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// Accept/Decline Request Response types
export interface AcceptRequestResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    statusChangedAt: string;
  };
}

export interface DeclineRequestResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    statusChangedAt: string;
  };
}

// Request Stats types
export interface EarningsTrendItem {
  month: string;
  amount: number;
}

export interface JobsByStatus {
  created: number;
  submitted: number;
  in_review: number;
  in_progress: number;
  approved: number;
  rejected: number;
}

export interface RequestStatsData {
  totalEarnings: number;
  pendingEarnings: number;
  completionRate: number;
  jobsByStatus: JobsByStatus;
  earningsTrend: EarningsTrendItem[];
}

export interface RequestStatsResponse {
  success: boolean;
  data: RequestStatsData;
}

// Creator Requests API functions
export const creatorRequestsApi = {
  getRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) =>
    api.get<CreatorRequestsResponse>('/creator/requests', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search }),
        ...(params?.sortBy && { sortBy: params.sortBy }),
        ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      },
    }),
  getRequest: (requestId: string, signal?: AbortSignal) =>
    api.get<{ success: boolean; data: CreatorRequestItem }>(`/requests/${requestId}`, {
      ...(signal ? { signal } : {}),
    }),
  acceptRequest: (requestId: string) =>
    api.post<AcceptRequestResponse>(`/requests/${requestId}/accept`),
  declineRequest: (requestId: string) =>
    api.post<DeclineRequestResponse>(`/requests/${requestId}/decline`),
  getRequestStats: () =>
    api.get<RequestStatsResponse>('/creators/me/request-stats'),
};

// Notification types
export interface ApiNotification {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  type: string;
  details: string | null;
  cta: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationCountResponse {
  count: number;
}

export interface NotificationsResponse {
  items: ApiNotification[];
  next_cursor: string | null;
}

// Notifications API functions
export const notificationsApi = {
  getCount: () => api.get<NotificationCountResponse>('/notifications/count', { params: { is_read: 0 } }),
  getNotifications: () => api.get<NotificationsResponse>('/notifications'),
  markAllAsRead: () => api.post('/notifications/read'),
  markAsRead: (notificationId: string) => api.post<ApiNotification>(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId: string) => api.delete<ApiNotification>(`/notifications/${notificationId}`),
  clearAll: () => api.delete('/notifications'),
};

// Notification Preferences types
export interface ApiNotificationPreferences {
  inAppEnabled: boolean;
  emailDigestEnabled: boolean;
  emailDigestFrequency: "instant" | "hourly" | "daily" | "weekly";
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  notifyMessages: boolean;
  notifyStatusChanges: boolean;
  notifyAssignments: boolean;
  notifySystem: boolean;
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: ApiNotificationPreferences;
}

export interface UpdateNotificationPreferencesRequest {
  inAppEnabled?: boolean;
  emailDigestEnabled?: boolean;
  emailDigestFrequency?: "instant" | "hourly" | "daily" | "weekly";
  soundEnabled?: boolean;
  browserNotificationsEnabled?: boolean;
  notifyMessages?: boolean;
  notifyStatusChanges?: boolean;
  notifyAssignments?: boolean;
  notifySystem?: boolean;
}

export interface UpdateNotificationPreferencesResponse {
  success: boolean;
  data: {
    soundEnabled?: boolean;
    emailDigestEnabled?: boolean;
    emailDigestFrequency?: "instant" | "hourly" | "daily" | "weekly";
    updatedAt: string;
  };
}

// Notification Preferences API functions
export const notificationPreferencesApi = {
  getPreferences: () => api.get<NotificationPreferencesResponse>('/notifications/preferences'),
  updatePreferences: (data: UpdateNotificationPreferencesRequest) =>
    api.patch<UpdateNotificationPreferencesResponse>('/notifications/preferences', data),
};

// File Upload types
export interface FileUploadResponse {
  success: boolean;
  data: {
    id: string;
    storageUrl: string;
    fileName: string;
  };
}

// File Delete Response types
export interface FileDeleteResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// File Upload API functions
export const filesApi = {
  uploadFile: (file: File, requestId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    // Determine file_type based on file.type
    let fileType = 'document'; // default
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.includes('pdf')) {
      fileType = 'document';
    }

    formData.append('file_type', fileType);
    formData.append('context', 'deliverable');
    formData.append('request_id', requestId);

    return api.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileId: string) =>
    api.delete<FileDeleteResponse>(`/files/${fileId}?hardDelete=true`),
};

// Deliverables API functions
export const deliverablesApi = {
  submitDeliverable: (deliverableId: string) =>
    api.post(`/deliverables/${deliverableId}/submit`),
  approveDeliverable: (deliverableId: string) =>
    api.post<{ success: boolean; data: { id: string; status: string; approvedAt: string } }>(
      `/deliverables/${deliverableId}/approve`
    ),
  requestRevision: (deliverableId: string, feedback: string) =>
    api.post<{ success: boolean; data: { id: string; status: string } }>(
      `/deliverables/${deliverableId}/request-revision`,
      { feedback }
    ),
};
