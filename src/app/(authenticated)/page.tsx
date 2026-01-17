"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Award,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  MessageSquare,
  Loader2,
  Activity,
  UserCheck,
  Percent,
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
  Legend,
} from "recharts";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminService,
  type PlatformMetrics,
  type SignupStats,
  type ActivityTrend,
  type EngagementMetrics,
  type ContentAnalytics,
} from "@/services/admin.service";
import { usersService, type User } from "@/services/users.service";

const COLORS = ["#00FF80", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [signupStats, setSignupStats] = useState<SignupStats | null>(null);
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [content, setContent] = useState<ContentAnalytics | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        adminService.getPlatformMetrics(),
        adminService.getSignupStats(),
        adminService.getActivityTrends(30),
        usersService.getAllUsers(),
        adminService.getEngagementMetrics(),
        adminService.getContentAnalytics(),
      ]);

      if (results[0].status === "fulfilled") {
        setMetrics(results[0].value);
      } else {
        console.error("Failed to load platform metrics:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        setSignupStats(results[1].value);
      } else {
        console.error("Failed to load signup stats:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setActivityTrends(results[2].value);
      } else {
        console.error("Failed to load activity trends:", results[2].reason);
      }

      if (results[3].status === "fulfilled") {
        setRecentUsers(results[3].value.slice(0, 5));
      } else {
        console.error("Failed to load users:", results[3].reason);
      }

      if (results[4].status === "fulfilled") {
        setEngagement(results[4].value);
      } else {
        console.error("Failed to load engagement metrics:", results[4].reason);
      }

      if (results[5].status === "fulfilled") {
        setContent(results[5].value);
      } else {
        console.error("Failed to load content analytics:", results[5].reason);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <Button onClick={loadDashboardData} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const userActivityData = [
    { name: "DAU", value: engagement?.dau || 0, color: "#00FF80" },
    { name: "WAU", value: engagement?.wau || 0, color: "#3B82F6" },
    { name: "MAU", value: engagement?.mau || 0, color: "#F59E0B" },
  ];

  const featureUsageData = engagement
    ? [
        { name: "Quiz", value: engagement.featureUsage.quiz, color: "#00FF80" },
        { name: "Chat", value: engagement.featureUsage.chat, color: "#3B82F6" },
        { name: "Streak", value: engagement.featureUsage.streak, color: "#F59E0B" },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={Users}
          trend={{
            value: `${engagement?.activeRate || 0}% active`,
            positive: true,
          }}
          color="#00FF80"
        />
        <StatsCard
          title="Premium Users"
          value={metrics.premiumUsers}
          icon={Zap}
          trend={{
            value: `${metrics.premiumConversionRate.toFixed(1)}% conversion`,
            positive: true,
          }}
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
          title="Daily Active Users"
          value={engagement?.dau || 0}
          icon={UserCheck}
          color="#00FF80"
        />
        <StatsCard
          title="Weekly Active Users"
          value={engagement?.wau || 0}
          icon={Activity}
          color="#3B82F6"
        />
        <StatsCard
          title="Monthly Active Users"
          value={engagement?.mau || 0}
          icon={Percent}
          trend={{
            value: `${engagement?.activeRate || 0}% of total`,
            positive: true,
          }}
          color="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Quizzes Completed"
          value={metrics.totalQuizzesCompleted.toLocaleString()}
          icon={Target}
          trend={{
            value: `${content?.avgQuizPerUser || 0} avg/user`,
            positive: true,
          }}
          color="#00FF80"
        />
        <StatsCard
          title="Total Chats"
          value={content?.totalChats || metrics.totalChats}
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
            <CardTitle className="text-lg">User Growth (Last 30 Days)</CardTitle>
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
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
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
                    dot={{ fill: "#00FF80", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={featureUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {featureUsageData.map((entry, index) => (
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Trends</CardTitle>
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
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content?.topTopics.slice(0, 6).map((topic, index) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: `${COLORS[index % COLORS.length]}20`,
                        color: COLORS[index % COLORS.length],
                      }}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium capitalize">{topic.topic}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {topic.count} chats
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#00FF80]">
                      {user.xp} XP
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivityData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.color,
                        width: `${Math.min((item.value / (engagement?.totalUsers || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Overview</CardTitle>
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
                  {new Date(month.month + "-01").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
