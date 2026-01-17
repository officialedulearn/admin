import axios from "axios";

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

export interface EngagementMetrics {
  dau: number;
  wau: number;
  mau: number;
  featureUsage: {
    quiz: number;
    chat: number;
    streak: number;
  };
  totalUsers: number;
  activeRate: string;
}

export interface RetentionData {
  cohort: string;
  totalUsers: number;
  retained: number;
  retentionRate: string;
}

export interface ContentAnalytics {
  topTopics: { topic: string; count: number }[];
  totalChats: number;
  totalQuizzes: number;
  avgQuizPerUser: string;
}

export interface RevenueMetrics {
  totalRevenue: string;
  premiumUsers: number;
  conversionRate: string;
  arpu: string;
  arppu: string;
  totalReferrals: number;
  usersWithReferrals: number;
}

export const adminService = {
  async getSignupStats(
    startDate?: string,
    endDate?: string
  ): Promise<SignupStats> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axios.get(
      `/api/admin/analytics/signups?${params.toString()}`
    );
    return response.data;
  },

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const response = await axios.get("/api/admin/analytics/metrics");
    return response.data;
  },

  async getActivityTrends(days: number = 30): Promise<ActivityTrend[]> {
    const response = await axios.get(
      `/api/admin/analytics/activity-trends?days=${days}`
    );
    return response.data;
  },

  async getAllUsers(): Promise<AdminUser[]> {
    const response = await axios.get("/api/admin/users");
    return response.data;
  },

  async getEngagementMetrics(): Promise<EngagementMetrics> {
    const response = await axios.get("/api/admin/analytics/engagement");
    return response.data;
  },

  async getRetentionMetrics(): Promise<RetentionData[]> {
    const response = await axios.get("/api/admin/analytics/retention");
    return response.data;
  },  async getContentAnalytics(): Promise<ContentAnalytics> {
    const response = await axios.get("/api/admin/analytics/content");
    return response.data;
  },  async getRevenueMetrics(): Promise<RevenueMetrics> {
    const response = await axios.get("/api/admin/analytics/revenue");
    return response.data;
  },
};