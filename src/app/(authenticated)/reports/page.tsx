"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileJson, Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminService, type PlatformMetrics, type EngagementMetrics, type RevenueMetrics } from "@/services/admin.service";
import { usersService, type User } from "@/services/users.service";

type ExportType = "users" | "analytics" | "revenue";

export default function ReportsPage() {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportUsersCSV = async () => {
    try {
      setLoading("users");
      const users = await usersService.getAllUsers();

      const headers = [
        "ID",
        "Name",
        "Username",
        "Email",
        "Level",
        "XP",
        "Quizzes Completed",
        "Premium",
        "Verified",
        "Streak",
        "Last Login",
      ];

      const rows = users.map((user) => [
        user.id,
        user.name,
        user.username,
        user.email,
        user.level,
        user.xp,
        user.quizCompleted,
        user.isPremium ? "Yes" : "No",
        user.verified ? "Yes" : "No",
        user.streak,
        new Date(user.lastLoggedIn).toISOString(),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const date = new Date().toISOString().split("T")[0];
      downloadFile(csv, `users_export_${date}.csv`, "text/csv");
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
    } finally {
      setLoading(null);
    }
  };

  const exportAnalyticsJSON = async () => {
    try {
      setLoading("analytics");
      const [metrics, engagement, signups, content, retention] = await Promise.all([
        adminService.getPlatformMetrics(),
        adminService.getEngagementMetrics(),
        adminService.getSignupStats(startDate || undefined, endDate || undefined),
        adminService.getContentAnalytics(),
        adminService.getRetentionMetrics(),
      ]);

      const report = {
        generatedAt: new Date().toISOString(),
        dateRange: {
          start: startDate || "All time",
          end: endDate || "Present",
        },
        platformMetrics: metrics,
        engagement: engagement,
        signupStats: signups,
        contentAnalytics: content,
        retention: retention,
      };

      const json = JSON.stringify(report, null, 2);
      const date = new Date().toISOString().split("T")[0];
      downloadFile(json, `analytics_report_${date}.json`, "application/json");
      toast.success("Analytics exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics");
    } finally {
      setLoading(null);
    }
  };

  const exportRevenueCSV = async () => {
    try {
      setLoading("revenue");
      const [revenue, metrics] = await Promise.all([
        adminService.getRevenueMetrics(),
        adminService.getPlatformMetrics(),
      ]);

      const headers = ["Metric", "Value"];
      const rows = [
        ["Total Revenue", `$${revenue.totalRevenue}`],
        ["Premium Users", revenue.premiumUsers.toString()],
        ["Conversion Rate", `${revenue.conversionRate}%`],
        ["ARPU (Avg Revenue Per User)", `$${revenue.arpu}`],
        ["ARPPU (Avg Revenue Per Paying User)", `$${revenue.arppu}`],
        ["Total Referrals", revenue.totalReferrals.toString()],
        ["Users With Referrals", revenue.usersWithReferrals.toString()],
        ["Total Users", metrics.totalUsers.toString()],
        ["Active Users (Month)", metrics.activeUsersMonth.toString()],
      ];

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const date = new Date().toISOString().split("T")[0];
      downloadFile(csv, `revenue_report_${date}.csv`, "text/csv");
      toast.success("Revenue report exported successfully");
    } catch (error) {
      toast.error("Failed to export revenue report");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Reports & Export</h1>
        <p className="text-muted-foreground">
          Download your data in various formats
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Optional: Filter analytics export by date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00FF80]/10">
                <FileSpreadsheet className="w-6 h-6 text-[#00FF80]" />
              </div>
              <div>
                <CardTitle>User Export</CardTitle>
                <CardDescription>All users as CSV</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all user data including name, email, XP, level, premium status,
              and activity information.
            </p>
            <Button
              onClick={exportUsersCSV}
              disabled={loading === "users"}
              className="w-full gap-2"
            >
              {loading === "users" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Users CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                <FileJson className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div>
                <CardTitle>Analytics Export</CardTitle>
                <CardDescription>Full report as JSON</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Complete analytics report including metrics, engagement, signups,
              content analytics, and retention data.
            </p>
            <Button
              onClick={exportAnalyticsJSON}
              disabled={loading === "analytics"}
              variant="outline"
              className="w-full gap-2"
            >
              {loading === "analytics" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Analytics JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F59E0B]/10">
                <FileSpreadsheet className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <CardTitle>Revenue Export</CardTitle>
                <CardDescription>Financial summary as CSV</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export revenue metrics including total revenue, conversion rates,
              ARPU, ARPPU, and referral statistics.
            </p>
            <Button
              onClick={exportRevenueCSV}
              disabled={loading === "revenue"}
              variant="outline"
              className="w-full gap-2"
            >
              {loading === "revenue" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Revenue CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Recent exports from this session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No exports yet in this session</p>
            <p className="text-sm">Exports are downloaded directly to your device</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
