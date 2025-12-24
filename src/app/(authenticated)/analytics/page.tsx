"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Activity, Loader2, Calendar } from "lucide-react";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService, type PlatformMetrics, type SignupStats, type ActivityTrend } from "@/services/admin.service";

const COLORS = ["#00FF80", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [signupStats, setSignupStats] = useState<SignupStats | null>(null);
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30" | "90">("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [metricsData, signupsData, trendsData] = await Promise.all([
        adminService.getPlatformMetrics(),
        adminService.getSignupStats(),
        adminService.getActivityTrends(parseInt(timeRange)),
      ]);

      setMetrics(metricsData);
      setSignupStats(signupsData);
      setActivityTrends(trendsData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
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

  const levelDistribution = [
    { name: "Novice", value: 40, color: "#6B7280" },
    { name: "Beginner", value: 25, color: "#3B82F6" },
    { name: "Intermediate", value: 20, color: "#F59E0B" },
    { name: "Advanced", value: 10, color: "#8B5CF6" },
    { name: "Expert", value: 5, color: "#00FF80" },
  ];

  const activityTypeData = activityTrends.reduce(
    (acc, trend) => {
      acc.quiz += trend.quiz;
      acc.chat += trend.chat;
      acc.streak += trend.streak;
      return acc;
    },
    { quiz: 0, chat: 0, streak: 0 }
  );

  const activityPieData = [
    { name: "Quiz", value: activityTypeData.quiz, color: "#00FF80" },
    { name: "Chat", value: activityTypeData.chat, color: "#3B82F6" },
    { name: "Streak", value: activityTypeData.streak, color: "#F59E0B" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Analytics</h1>
          <p className="text-muted-foreground">Detailed platform metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(["7", "14", "30", "90"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "success" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}d
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-[#00FF80]">+{metrics.activeUsersToday} today</p>
              </div>
              <Users className="w-8 h-8 text-[#00FF80]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium Rate</p>
                <p className="text-2xl font-bold">{metrics.premiumConversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{metrics.premiumUsers} premium users</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#F59E0B]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg XP/User</p>
                <p className="text-2xl font-bold">{metrics.averageXPPerUser.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{metrics.totalXPEarned.toLocaleString()} total</p>
              </div>
              <Activity className="w-8 h-8 text-[#3B82F6]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Quiz/User</p>
                <p className="text-2xl font-bold">{metrics.averageQuizzesPerUser}</p>
                <p className="text-xs text-muted-foreground">{metrics.totalQuizzesCompleted.toLocaleString()} total</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#8B5CF6]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Daily signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signupStats?.daily.slice(-parseInt(timeRange)) || []}>
                  <defs>
                    <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00FF80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#00FF80"
                    strokeWidth={2}
                    fill="url(#signupGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Breakdown by activity type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Daily activity breakdown over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="quiz" fill="#00FF80" name="Quiz" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chat" fill="#3B82F6" name="Chat" radius={[4, 4, 0, 0]} />
                <Bar dataKey="streak" fill="#F59E0B" name="Streak" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity Status</CardTitle>
            <CardDescription>Active users across time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Active Today</p>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#00FF80]">{metrics.activeUsersToday}</p>
                  <p className="text-xs text-muted-foreground">
                    {((metrics.activeUsersToday / metrics.totalUsers) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Active This Week</p>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#3B82F6]">{metrics.activeUsersWeek}</p>
                  <p className="text-xs text-muted-foreground">
                    {((metrics.activeUsersWeek / metrics.totalUsers) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Active This Month</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#F59E0B]">{metrics.activeUsersMonth}</p>
                  <p className="text-xs text-muted-foreground">
                    {((metrics.activeUsersMonth / metrics.totalUsers) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Signups by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupStats?.monthly.slice(-6) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value + "-01").toLocaleDateString("en-US", { month: "short" })
                    }
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                    labelFormatter={(value) =>
                      new Date(value + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    }
                  />
                  <Bar dataKey="count" fill="#00FF80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


