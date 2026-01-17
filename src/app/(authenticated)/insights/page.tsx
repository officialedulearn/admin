"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Zap,
  MessageSquare,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  adminService,
  type EngagementMetrics,
  type RetentionData,
  type RevenueMetrics,
  type ContentAnalytics,
  type PlatformMetrics,
} from "@/services/admin.service";

interface Insight {
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [retention, setRetention] = useState<RetentionData[]>([]);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [content, setContent] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, engagementData, retentionData, revenueData, contentData] =
        await Promise.all([
          adminService.getPlatformMetrics(),
          adminService.getEngagementMetrics(),
          adminService.getRetentionMetrics(),
          adminService.getRevenueMetrics(),
          adminService.getContentAnalytics(),
        ]);

      setMetrics(metricsData);
      setEngagement(engagementData);
      setRetention(retentionData);
      setRevenue(revenueData);
      setContent(contentData);

      generateInsights(
        metricsData,
        engagementData,
        retentionData,
        revenueData,
        contentData
      );
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (
    metrics: PlatformMetrics,
    engagement: EngagementMetrics,
    retention: RetentionData[],
    revenue: RevenueMetrics,
    content: ContentAnalytics
  ) => {
    const newInsights: Insight[] = [];

    const activeRate = parseFloat(engagement.activeRate);
    if (activeRate >= 40) {
      newInsights.push({
        type: "success",
        title: "Strong User Engagement",
        description: `${activeRate}% of users were active in the last 30 days. This is above the industry average of 20-30%.`,
        metric: `${activeRate}% MAU rate`,
      });
    } else if (activeRate >= 20) {
      newInsights.push({
        type: "info",
        title: "Average User Engagement",
        description: `${activeRate}% monthly active rate is within industry norms. Consider re-engagement campaigns.`,
        metric: `${activeRate}% MAU rate`,
        action: "Send push notifications to inactive users",
      });
    } else {
      newInsights.push({
        type: "warning",
        title: "Low User Engagement",
        description: `Only ${activeRate}% of users are active monthly. Urgent attention needed.`,
        metric: `${activeRate}% MAU rate`,
        action: "Launch re-engagement email campaign",
      });
    }

    const conversionRate = parseFloat(revenue.conversionRate);
    if (conversionRate >= 5) {
      newInsights.push({
        type: "success",
        title: "Excellent Conversion Rate",
        description: `${conversionRate}% premium conversion is strong for education platforms.`,
        metric: `${conversionRate}% conversion`,
      });
    } else if (conversionRate >= 2) {
      newInsights.push({
        type: "info",
        title: "Room for Conversion Growth",
        description: `${conversionRate}% conversion rate. Consider highlighting premium features more.`,
        metric: `${conversionRate}% conversion`,
        action: "A/B test premium upsell messaging",
      });
    } else {
      newInsights.push({
        type: "warning",
        title: "Low Premium Conversion",
        description: `${conversionRate}% conversion is below typical benchmarks of 2-5%.`,
        metric: `${conversionRate}% conversion`,
        action: "Review premium value proposition",
      });
    }

    if (retention.length > 0) {
      const avgRetention =
        retention.reduce((sum, r) => sum + parseFloat(r.retentionRate), 0) /
        retention.length;

      if (avgRetention >= 40) {
        newInsights.push({
          type: "success",
          title: "Strong User Retention",
          description: `Average weekly retention of ${avgRetention.toFixed(1)}% shows users find value.`,
          metric: `${avgRetention.toFixed(1)}% avg retention`,
        });
      } else if (avgRetention >= 20) {
        newInsights.push({
          type: "info",
          title: "Moderate Retention",
          description: `${avgRetention.toFixed(1)}% retention. Focus on first-week experience.`,
          metric: `${avgRetention.toFixed(1)}% avg retention`,
          action: "Improve onboarding flow",
        });
      } else {
        newInsights.push({
          type: "warning",
          title: "Retention Needs Attention",
          description: `${avgRetention.toFixed(1)}% retention indicates users aren't finding long-term value.`,
          metric: `${avgRetention.toFixed(1)}% avg retention`,
          action: "Survey churned users for feedback",
        });
      }
    }

    if (content.topTopics.length > 0) {
      const topTopic = content.topTopics[0];
      newInsights.push({
        type: "info",
        title: `"${topTopic.topic}" is Trending`,
        description: `${topTopic.count} conversations about ${topTopic.topic}. Consider creating more content.`,
        metric: `${topTopic.count} chats`,
        action: `Create ${topTopic.topic} learning roadmap`,
      });
    }

    if (revenue.totalReferrals > 0) {
      const referralRate = (revenue.usersWithReferrals / metrics.totalUsers) * 100;
      if (referralRate < 5) {
        newInsights.push({
          type: "info",
          title: "Referral Program Opportunity",
          description: `Only ${referralRate.toFixed(1)}% of users have referred others. Incentivize sharing.`,
          metric: `${revenue.totalReferrals} referrals`,
          action: "Increase referral rewards",
        });
      } else {
        newInsights.push({
          type: "success",
          title: "Referral Program Working",
          description: `${referralRate.toFixed(1)}% of users have referred others.`,
          metric: `${revenue.totalReferrals} referrals`,
        });
      }
    }

    const atRiskUsers = metrics.totalUsers - metrics.activeUsersMonth;
    if (atRiskUsers > metrics.totalUsers * 0.5) {
      newInsights.push({
        type: "warning",
        title: "High At-Risk User Count",
        description: `${atRiskUsers.toLocaleString()} users haven't been active in 30+ days.`,
        metric: `${atRiskUsers.toLocaleString()} at-risk`,
        action: "Launch win-back campaign",
      });
    }

    setInsights(newInsights);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#00FF80]" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      case "info":
        return <Target className="w-5 h-5 text-[#3B82F6]" />;
    }
  };

  const getBorderColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "border-l-[#00FF80]";
      case "warning":
        return "border-l-[#F59E0B]";
      case "info":
        return "border-l-[#3B82F6]";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Business Insights
        </h1>
        <p className="text-muted-foreground">
          Actionable recommendations based on your data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00FF80]/10">
                <Users className="w-5 h-5 text-[#00FF80]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">
                  {metrics?.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                <Zap className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rate</p>
                <p className="text-xl font-bold">{engagement?.activeRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F59E0B]/10">
                <Crown className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium Rate</p>
                <p className="text-xl font-bold">{revenue?.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
                <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Chats</p>
                <p className="text-xl font-bold">
                  {content?.totalChats.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>
              Auto-generated recommendations from your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 bg-secondary/30 ${getBorderColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{insight.title}</h3>
                        {insight.metric && (
                          <span className="text-sm text-muted-foreground">
                            {insight.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <p className="text-sm text-[#00FF80] mt-2 font-medium">
                          → {insight.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>Breakdown of user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#00FF80]" />
                    <span>Active Users</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{metrics?.activeUsersMonth}</p>
                    <p className="text-xs text-muted-foreground">
                      {((metrics?.activeUsersMonth || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span>Premium Users</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{revenue?.premiumUsers}</p>
                    <p className="text-xs text-muted-foreground">
                      {revenue?.conversionRate}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span>At-Risk Users</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {(metrics?.totalUsers || 0) - (metrics?.activeUsersMonth || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(((metrics?.totalUsers || 0) - (metrics?.activeUsersMonth || 0)) / (metrics?.totalUsers || 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Topics This Week</CardTitle>
              <CardDescription>Most discussed learning topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {content?.topTopics.slice(0, 5).map((topic, index) => (
                  <div
                    key={topic.topic}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="capitalize font-medium">{topic.topic}</span>
                    </div>
                    <span className="text-muted-foreground">{topic.count} chats</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
