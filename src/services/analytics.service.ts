import { usersService } from "./users.service";
import { activityService } from "./activity.service";
import { rewardsService } from "./rewards.service";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRewards: number;
  totalActivities: number;
  totalXP: number;
  averageXP: number;
  userGrowth: {
    today: number;
    week: number;
    month: number;
  };
}

export interface ActivityBreakdown {
  quiz: number;
  chat: number;
  streak: number;
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [users, activities, rewards] = await Promise.all([
      usersService.getAllUsers(),
      activityService.getAllActivities(),
      rewardsService.getAllRewards(),
    ]);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter((u) => {
      const lastLogin = new Date(u.lastLoggedIn);
      return lastLogin >= oneWeekAgo;
    }).length;

    const premiumUsers = users.filter((u) => u.isPremium).length;
    const totalXP = users.reduce((sum, u) => sum + u.xp, 0);
    const averageXP = users.length > 0 ? Math.round(totalXP / users.length) : 0;

    const usersToday = users.filter((u) => {
      const lastLogin = new Date(u.lastLoggedIn);
      return lastLogin >= oneDayAgo;
    }).length;

    const usersThisWeek = users.filter((u) => {
      const lastLogin = new Date(u.lastLoggedIn);
      return lastLogin >= oneWeekAgo;
    }).length;

    const usersThisMonth = users.filter((u) => {
      const lastLogin = new Date(u.lastLoggedIn);
      return lastLogin >= oneMonthAgo;
    }).length;

    return {
      totalUsers: users.length,
      activeUsers,
      premiumUsers,
      totalRewards: rewards.length,
      totalActivities: activities.length,
      totalXP,
      averageXP,
      userGrowth: {
        today: usersToday,
        week: usersThisWeek,
        month: usersThisMonth,
      },
    };
  },

  async getActivityBreakdown(): Promise<ActivityBreakdown> {
    const activities = await activityService.getAllActivities();

    return {
      quiz: activities.filter((a) => a.type === "quiz").length,
      chat: activities.filter((a) => a.type === "chat").length,
      streak: activities.filter((a) => a.type === "streak").length,
    };
  },
};
