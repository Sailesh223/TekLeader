import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ManagerEntry {
  rank: number;
  rankChange: number | null;
  manager: {
    id: number;
    displayName: string;
    email: string | null;
    avatarUrl: string | null;
  };
  functionalHead: string;
  headcount: number;
  oneOnOnes: number;
  notUtilising: number;
  utilization: number;
  teamSizeScore: number;
  consistencyScore: number;
  finalScore: number;
  classificationBand: string;
  badges: Badge[];
  badgeCount: number;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  iconKey: string;
  color: string;
}

export interface LeaderboardResponse {
  month: string;
  totalManagers: number;
  filteredManagers: number;
  page: number;
  size: number;
  totalPages: number;
  managers: ManagerEntry[];
  statistics: {
    averageFinalScore: number;
    averageUtilization: number;
    bandDistribution: Record<string, number>;
  };
}

export interface UploadResponse {
  status: string;
  month: string;
  uploadMode: string;
  summary: {
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsSkipped: number;
    recordsFailed: number;
  };
  processingTimeMs: number;
  uploadId: number;
  errors: Array<{
    row: number;
    column: string;
    value: string;
    message: string;
  }>;
}

export interface DeleteResponse {
  status: string;
  month?: string;
  deletedMetrics: number;
  deletedBadges: number;
}

export interface FormulaConfig {
  id?: string;
  version?: number;
  utilizationWeight: number;
  teamSizeWeight: number;
  consistencyWeight: number;
  consistencyPenaltyMultiplier?: number;
  tierSameScore?: number;
  tierOneLevelDownScore?: number;
  tierTwoLevelsDownScore?: number;
  tierThreeLevelsDownScore?: number;
  seasonalPeriodType?: string;
  seasonalCustomMonths?: number;
  teamSizeMapping: {
    '1-3': number;
    '4-6': number;
    '7-10': number;
    '10+': number;
  };
  classificationThresholds?: any;
  active?: boolean;
  createdAt?: string;
  createdBy?: string;
}

export const leaderboardApi = {
  getLeaderboard: async (
    month: string,
    functionalHead: string = 'all',
    band: string = 'all',
    search: string = '',
    page: number = 0,
    size: number = 25
  ): Promise<LeaderboardResponse> => {
    const response = await apiClient.get('/leaderboard', {
      params: { month, functionalHead, band, search, page, size }
    });
    return response.data;
  },

  getAvailableMonths: async (): Promise<{ months: string[]; latestMonth: string }> => {
    const response = await apiClient.get('/months');
    return response.data;
  },

  getAvailableSeasons: async (): Promise<{ seasons: string[]; latestSeason: string }> => {
    const response = await apiClient.get('/seasons');
    return response.data;
  },

  deleteDataByMonth: async (month: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete('/data', { params: { month } });
    return response.data;
  },

  deleteAllData: async (): Promise<DeleteResponse> => {
    const response = await apiClient.delete('/data/all');
    return response.data;
  },

  getSeasonalLeaderboard: async (season?: string): Promise<any[]> => {
    const response = await apiClient.get('/leaderboard/seasonal', {
      params: season ? { season } : {}
    });
    return response.data;
  },

  getOverallLeaderboard: async (): Promise<any[]> => {
    const response = await apiClient.get('/leaderboard/overall');
    return response.data;
  },
};

export const uploadApi = {
  uploadMonthlyData: async (
    file: File,
    month: string,
    mode: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/uploads/monthly', formData, {
      params: { month, mode },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const formulaApi = {
  getCurrentFormula: async (): Promise<FormulaConfig> => {
    const response = await apiClient.get('/formula/current');
    return response.data;
  },

  updateFormula: async (formula: FormulaConfig): Promise<any> => {
    const response = await apiClient.post('/formula', formula);
    return response.data;
  },

  getAllFormulas: async (): Promise<{ formulas: FormulaConfig[] }> => {
    const response = await apiClient.get('/formula/all');
    return response.data;
  },
};

export interface ManagerHistoryResponse {
  manager: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    overallXP: number;
    seasonalXP: number;
    currentStreak: number;
    longestStreak: number;
  };
  history: MonthlyPerformance[];
  summary: PerformanceSummary;
  teamMembers: TeamMember[];
  allBadges: BadgeInfo[];
}

export interface MonthlyPerformance {
  month: string;
  rank: number;
  rankChange: number | null;
  finalScore: number;
  utilization: number;
  teamSizeScore: number;
  consistencyScore: number;
  classificationBand: string;
  headcount: number;
  oneOnOnes: number;
  notUtilising: number;
  functionalHead: string;
  badges: BadgeInfo[];
}

export interface PerformanceSummary {
  totalMonths: number;
  bestRank: number;
  bestRankMonth: string;
  averageScore: number;
  averageUtilization: number;
  totalBadges: number;
  consecutiveImprovements: number;
  trend: 'improving' | 'declining' | 'stable';
  scoreChange: number;
  rankImprovement: number;
  motivationalMessage: string;
}

export interface TeamMember {
  name: string;
  role: string;
  utilization: number;
}

export interface BadgeInfo {
  id: string;
  code: string;
  name: string;
  iconKey: string;
  color: string;
  month: string;
  metadata: any;
}

export const managerApi = {
  getHistory: async (displayName: string): Promise<ManagerHistoryResponse> => {
    const response = await apiClient.get('/manager/history', {
      params: { displayName }
    });
    return response.data;
  },
};

// Notification types and interfaces
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  priority: string;
}

export const notificationApi = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/${userId}`);
    return response.data;
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const response = await apiClient.get(`/notifications/${userId}/unread-count`);
    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/mark-read`);
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await apiClient.put(`/notifications/${userId}/mark-all-read`);
  },
};

// Feed types and interfaces
export interface FeedPost {
  id: string;
  type: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mediaUrls?: string[];
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  likes: string[];
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CreatePostRequest {
  authorId: string;
  content: string;
  mediaUrls?: string[];
}

export interface AddCommentRequest {
  authorId: string;
  content: string;
}

export const feedApi = {
  getFeed: async (page: number = 0, size: number = 20): Promise<{ content: FeedPost[]; totalPages: number; totalElements: number }> => {
    const response = await apiClient.get('/feed', {
      params: { page, size }
    });
    return response.data;
  },

  createPost: async (request: CreatePostRequest): Promise<FeedPost> => {
    const response = await apiClient.post('/feed', request);
    return response.data;
  },

  addComment: async (postId: string, request: AddCommentRequest): Promise<FeedComment> => {
    const response = await apiClient.post(`/feed/${postId}/comments`, request);
    return response.data;
  },

  getPostComments: async (postId: string): Promise<FeedComment[]> => {
    const response = await apiClient.get(`/feed/${postId}/comments`);
    return response.data;
  },

  toggleLike: async (postId: string, userId: string): Promise<void> => {
    await apiClient.post(`/feed/${postId}/like`, { userId });
  },
};

// Achievement types and interfaces
export interface Achievement {
  id: string;
  managerId: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  unlockedAt: string;
}

export const achievementApi = {
  getManagerAchievements: async (managerId: string): Promise<Achievement[]> => {
    const response = await apiClient.get(`/achievements/${managerId}`);
    return response.data;
  },
};

