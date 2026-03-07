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

export const leaderboardApi = {
  getLeaderboard: async (params: {
    month: string;
    functionalHead?: string;
    band?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<LeaderboardResponse> => {
    const response = await apiClient.get('/leaderboard', { params });
    return response.data;
  },

  getAvailableMonths: async (): Promise<{ months: string[]; latestMonth: string }> => {
    const response = await apiClient.get('/months');
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

