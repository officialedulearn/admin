"use client";

import { useState, useEffect } from "react";
import { Activity, Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { activityService, type Activity as ActivityType } from "@/services/activity.service";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "quiz" | "chat" | "streak">("all");

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    let filtered = activities;

    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [searchQuery, typeFilter, activities]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getAllActivities();
      setActivities(data);
      setFilteredActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "text-[#00FF80] bg-[#00FF80]/20";
      case "chat":
        return "text-[#3B82F6] bg-[#3B82F6]/20";
      case "streak":
        return "text-[#F59E0B] bg-[#F59E0B]/20";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const activityStats = {
    total: activities.length,
    quiz: activities.filter((a) => a.type === "quiz").length,
    chat: activities.filter((a) => a.type === "chat").length,
    streak: activities.filter((a) => a.type === "streak").length,
    totalXP: activities.reduce((sum, a) => sum + a.xpEarned, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Activity Log</h1>
        <p className="text-muted-foreground">View all platform activities</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Activities</p>
            <p className="text-2xl font-bold">{activityStats.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Quiz Activities</p>
            <p className="text-2xl font-bold text-[#00FF80]">{activityStats.quiz.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Chat Activities</p>
            <p className="text-2xl font-bold text-[#3B82F6]">{activityStats.chat.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Streak Activities</p>
            <p className="text-2xl font-bold text-[#F59E0B]">{activityStats.streak.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total XP Earned</p>
            <p className="text-2xl font-bold">{activityStats.totalXP.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-[300px]"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "quiz", "chat", "streak"] as const).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "success" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>XP Earned</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.slice(0, 100).map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        getTypeColor(activity.type)
                      )}
                    >
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="font-medium">
                      {activity.title || `${activity.type} activity`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getTypeColor(activity.type)
                    )}
                  >
                    {activity.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-[#00FF80]">+{activity.xpEarned} XP</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No activities found</p>
          </div>
        )}
        {filteredActivities.length > 100 && (
          <div className="text-center py-4 text-sm text-muted-foreground border-t border-border">
            Showing first 100 of {filteredActivities.length} activities
          </div>
        )}
      </div>
    </div>
  );
}


