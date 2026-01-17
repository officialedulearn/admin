"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Loader2,
  Calendar,
  DollarSign,
  UserMinus,
  Share2,
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminService,
  type PlatformMetrics,
  type SignupStats,
  type ActivityTrend,
  type RetentionData,
  type RevenueMetrics,
  type ContentAnalytics,
} from "@/services/admin.service";

const COLORS = ["#00FF80", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [signupStats, setSignupStats] = useState<SignupStats | null>(null);
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [retention, setRetention] = useState<RetentionData[]>([]);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [content, setContent] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30" | "90">("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [metricsData, signupsData, trendsData, retentionData, revenueData, contentData] =
        await Promise.all([
          adminService.getPlatformMetrics(),
          adminService.getSignupStats(),
          adminService.getActivityTrends(parseInt(timeRange)),
          adminService.getRetentionMetrics(),
          adminService.getRevenueMetrics(),
          adminService.getContentAnalytics(),
        ]);

      setMetrics(metricsData);
      setSignupStats(signupsData);
      setActivityTrends(trendsData);
      setRetention(retentionData);
      setRevenue(revenueData);
      setContent(contentData);
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

  const getRetentionColor = (rate: number) => {
    if (rate >= 50) return "#00FF80";
    if (rate >= 30) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed platform metrics and insights
          </p>
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
                <p className="text-2xl font-bold">
                  {metrics.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-[#00FF80]">
                  +{metrics.activeUsersToday} today
                </p>
              </div>
              <Users className="w-8 h-8 text-[#00FF80]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${parseFloat(revenue?.totalRevenue || "0").toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ARPU: ${revenue?.arpu || "0"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#F59E0B]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{revenue?.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {revenue?.premiumUsers} premium users
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#3B82F6]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{revenue?.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">
                  {revenue?.usersWithReferrals} referring users
                </p>
              </div>
              <Share2 className="w-8 h-8 text-[#8B5CF6]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Retention</CardTitle>
          <CardDescription>
            Percentage of users who returned after 1 week, by signup cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Cohort
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Users
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Retained
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Retention Rate
                  </th>
                  <th className="py-3 px-4 text-sm font-medium text-muted-foreground w-32">
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody>
                {retention.map((row) => (
                  <tr
                    key={row.cohort}
                    className="border-b border-border/50 hover:bg-secondary/30"
                  >
                    <td className="py-3 px-4 font-medium">{row.cohort}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {row.totalUsers}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {row.retained}
                    </td>
                    <td
                      className="text-right py-3 px-4 font-semibold"
                      style={{
                        color: getRetentionColor(parseFloat(row.retentionRate)),
                      }}
                    >
                      {row.retentionRate}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(parseFloat(row.retentionRate), 100)}%`,
                            backgroundColor: getRetentionColor(
                              parseFloat(row.retentionRate)
                            ),
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Daily signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={signupStats?.daily.slice(-parseInt(timeRange)) || []}
                >
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
            <CardTitle>Top Topics</CardTitle>
            <CardDescription>Most discussed topics in chats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content?.topTopics.slice(0, 8).map((topic, index) => (
                <div key={topic.topic} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `${COLORS[index % COLORS.length]}20`,
                      color: COLORS[index % COLORS.length],
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {topic.topic}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {topic.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(topic.count / (content?.topTopics[0]?.count || 1)) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Metrics</CardTitle>
            <CardDescription>Financial performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold text-[#00FF80]">
                    ${parseFloat(revenue?.totalRevenue || "0").toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-[#00FF80]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">ARPU</p>
                  <p className="text-lg font-bold">${revenue?.arpu}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">ARPPU</p>
                  <p className="text-lg font-bold">${revenue?.arppu}</p>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Premium Conversion
                    </p>
                    <p className="text-lg font-bold">{revenue?.conversionRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Premium Users</p>
                    <p className="text-lg font-bold text-[#F59E0B]">
                      {revenue?.premiumUsers}
                    </p>
                  </div>
                </div>
              </div>
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
                  <p className="text-2xl font-bold text-[#00FF80]">
                    {metrics.activeUsersToday}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((metrics.activeUsersToday / metrics.totalUsers) * 100).toFixed(
                      1
                    )}
                    % of total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Active This Week</p>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#3B82F6]">
                    {metrics.activeUsersWeek}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((metrics.activeUsersWeek / metrics.totalUsers) * 100).toFixed(
                      1
                    )}
                    % of total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Active This Month</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#F59E0B]">
                    {metrics.activeUsersMonth}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((metrics.activeUsersMonth / metrics.totalUsers) * 100).toFixed(
                      1
                    )}
                    % of total
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
                      new Date(value + "-01").toLocaleDateString("en-US", {
                        month: "short",
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
                    labelFormatter={(value) =>
                      new Date(value + "-01").toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
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
