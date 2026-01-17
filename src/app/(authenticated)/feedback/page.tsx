"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { feedbackService, type Feedback } from "@/services/feedback.service";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, []);

  useEffect(() => {
    let filtered = feedbackList;

    if (searchQuery) {
      filtered = filtered.filter(
        (feedback) =>
          feedback.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feedback.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((feedback) => feedback.status === statusFilter);
    }

    setFilteredFeedback(filtered);
  }, [searchQuery, statusFilter, feedbackList]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getAllFeedback();
      setFeedbackList(data);
      setFilteredFeedback(data);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "pending" | "reviewed" | "resolved") => {
    try {
      setUpdatingId(id);
      await feedbackService.updateFeedbackStatus(id, status);
      await loadFeedback();
    } catch (error) {
      console.error("Failed to update feedback status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "bug":
        return "bg-red-500/20 text-red-400";
      case "feature":
        return "bg-blue-500/20 text-blue-400";
      case "improvement":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "reviewed":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/20 text-green-400";
      case "reviewed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-orange-500/20 text-orange-400";
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">User Feedback</h1>
          <p className="text-muted-foreground">Review and manage user feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-bold">{feedbackList.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-[#00FF80]" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">
                {feedbackList.filter((f) => f.status === "pending").length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reviewed</p>
              <p className="text-2xl font-bold">
                {feedbackList.filter((f) => f.status === "reviewed").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">
                {feedbackList.filter((f) => f.status === "resolved").length}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
        <Button
          variant={statusFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className={cn(
            statusFilter === "all" && "bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
          )}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
          className={cn(
            statusFilter === "pending" && "bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
          )}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "reviewed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("reviewed")}
          className={cn(
            statusFilter === "reviewed" && "bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
          )}
        >
          Reviewed
        </Button>
        <Button
          variant={statusFilter === "resolved" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("resolved")}
          className={cn(
            statusFilter === "resolved" && "bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
          )}
        >
          Resolved
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedback.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell className="text-muted-foreground">
                  {new Date(feedback.createdAt).toLocaleDateString()} <br />
                  <span className="text-xs">{new Date(feedback.createdAt).toLocaleTimeString()}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs capitalize",
                      getCategoryColor(feedback.category)
                    )}
                  >
                    {feedback.category || "other"}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="max-w-md text-sm">{feedback.content}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(feedback.status)}
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs capitalize",
                        getStatusColor(feedback.status)
                      )}
                    >
                      {feedback.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {feedback.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(feedback.id, "reviewed")}
                        disabled={updatingId === feedback.id}
                        className="text-xs"
                      >
                        {updatingId === feedback.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Mark Reviewed"
                        )}
                      </Button>
                    )}
                    {feedback.status === "reviewed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(feedback.id, "resolved")}
                        disabled={updatingId === feedback.id}
                        className="text-xs"
                      >
                        {updatingId === feedback.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Mark Resolved"
                        )}
                      </Button>
                    )}
                    {feedback.status === "resolved" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(feedback.id, "pending")}
                        disabled={updatingId === feedback.id}
                        className="text-xs"
                      >
                        {updatingId === feedback.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Reopen"
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredFeedback.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No feedback found</p>
          </div>
        )}
      </div>
    </div>
  );
}














