"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Award,
  Activity,
  TrendingUp,
  UserPlus,
  Zap,
  Target,
  DollarSign,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService, type PlatformMetrics, type SignupStats, type ActivityTrend } from "@/services/admin.service";
import { usersService, type User } from "@/services/users.service";

const COLORS = ["#00FF80", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [signupStats, setSignupStats] = useState<SignupStats | null>(null);
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, signupsData, trendsData, usersData] = await Promise.all([
        adminService.getPlatformMetrics(),
        adminService.getSignupStats(),
        adminService.getActivityTrends(30),
        usersService.getAllUsers(),
      ]);

      setMetrics(metricsData);
      setSignupStats(signupsData);
      setActivityTrends(trendsData);
      setRecentUsers(usersData.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  const userLevelData = [
    { name: "Active Today", value: metrics.activeUsersToday, color: "#00FF80" },
    { name: "Active Week", value: metrics.activeUsersWeek, color: "#3B82F6" },
    { name: "Active Month", value: metrics.activeUsersMonth, color: "#F59E0B" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: `${metrics.activeUsersToday} active today`, positive: true }}
          color="#00FF80"
        />
        <StatsCard
          title="Premium Users"
          value={metrics.premiumUsers}
          icon={Zap}
          trend={{ value: `${metrics.premiumConversionRate.toFixed(1)}% conversion`, positive: true }}
          color="#F59E0B"
        />
        <StatsCard
          title="Total XP Earned"
          value={metrics.totalXPEarned.toLocaleString()}
          icon={TrendingUp}
          trend={{ value: `${metrics.averageXPPerUser} avg/user`, positive: true }}
          color="#3B82F6"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${parseFloat(metrics.totalRevenue).toFixed(2)}`}
          icon={DollarSign}
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Quizzes Completed"
          value={metrics.totalQuizzesCompleted.toLocaleString()}
          icon={Target}
          trend={{ value: `${metrics.averageQuizzesPerUser} avg/user`, positive: true }}
          color="#00FF80"
        />
        <StatsCard
          title="Total Chats"
          value={metrics.totalChats.toLocaleString()}
          icon={MessageSquare}
          color="#3B82F6"
        />
        <StatsCard
          title="Total Rewards"
          value={metrics.totalRewards}
          icon={Award}
          color="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signup Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupStats?.daily.slice(-30) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00FF80"
                    strokeWidth={2}
                    dot={{ fill: "#00FF80", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityTrends.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="quiz" fill="#00FF80" name="Quiz" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chat" fill="#3B82F6" name="Chat" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="streak" fill="#F59E0B" name="Streak" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {userLevelData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00FF80]/20 flex items-center justify-center">
                      <span className="text-[#00FF80] font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#00FF80]">{user.xp} XP</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Signup Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {signupStats?.monthly.slice(-4).map((month) => (
              <div
                key={month.month}
                className="text-center p-4 bg-secondary/50 rounded-lg"
              >
                <p className="text-2xl font-bold text-[#00FF80]">{month.count}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(month.month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


