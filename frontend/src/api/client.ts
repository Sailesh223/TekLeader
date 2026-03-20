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

