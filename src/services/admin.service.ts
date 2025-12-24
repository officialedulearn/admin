import axios from 'axios';
import { config } from '../lib/config';

const getHeaders = () => ({
  'x-admin-key': config.adminApiKey,
  'Content-Type': 'application/json',
});

export interface SignupStats {
  daily: { date: string; count: number }[];
  weekly: { week: string; count: number }[];
  monthly: { month: string; count: number }[];
  total: number;
}

export interface PlatformMetrics {
  totalUsers: number;
  premiumUsers: number;
  premiumConversionRate: number;
  totalQuizzesCompleted: number;
  averageQuizzesPerUser: number;
  totalXPEarned: number;
  averageXPPerUser: number;
  totalChats: number;
  totalRewards: number;
  totalRevenue: string;
  activeUsersToday: number;
  activeUsersWeek: number;
  activeUsersMonth: number;
}

export interface ActivityTrend {
  date: string;
  quiz: number;
  chat: number;
  streak: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  xp: number;
  level: string;
  isPremium: boolean;
  verified: boolean;
  lastLoggedIn: string;
  expoPushToken: string | null;
}

export const adminService = {
  async getSignupStats(startDate?: string, endDate?: string): Promise<SignupStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(
      `${config.apiUrl}/admin/analytics/signups?${params.toString()}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const response = await axios.get(
      `${config.apiUrl}/admin/analytics/metrics`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  async getActivityTrends(days: number = 30): Promise<ActivityTrend[]> {
    const response = await axios.get(
      `${config.apiUrl}/admin/analytics/activity-trends?days=${days}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  async getAllUsers(): Promise<AdminUser[]> {
    const response = await axios.get(
      `${config.apiUrl}/admin/users`,
      { headers: getHeaders() }
    );
    return response.data;
  },
};


