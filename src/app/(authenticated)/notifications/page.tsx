"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Users, User, Loader2, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notificationsService } from "@/services/notifications.service";
import { adminService, type AdminUser } from "@/services/admin.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    loadUsers();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/health", { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        setApiStatus("online");
      } else {
        setApiStatus("offline");
      }
    } catch {
      setApiStatus("offline");
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await adminService.getAllUsers();
      const usersWithToken = data.filter((u) => u.expoPushToken);
      setUsers(usersWithToken);
      setFilteredUsers(usersWithToken);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    if (!isBroadcast && selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      setLoading(true);
      let result;

      if (isBroadcast) {
        result = await notificationsService.broadcastNotification(title, content);
      } else {
        result = await notificationsService.sendNotificationToUsers(selectedUsers, title, content);
      }

      toast.success(`Notification sent! ${result.sent} delivered, ${result.failed} failed`);
      setTitle("");
      setContent("");
      setSelectedUsers([]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to send notification";
      
      console.error("Notification error:", error);
      
      if (errorMessage.includes("timeout") || errorMessage.includes("API server")) {
        toast.error(errorMessage, {
          duration: 8000,
          description: "Make sure your API server is running at http://localhost:3001",
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          {apiStatus === "offline" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-500">API Server Offline</span>
            </div>
          )}
          {apiStatus === "online" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF80]/10 border border-[#00FF80]/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[#00FF80]" />
              <span className="text-sm text-[#00FF80]">API Server Online</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">Send push notifications to users</p>
        {apiStatus === "offline" && (
          <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-500">
              ⚠️ Cannot connect to API server. Make sure your API server is running at{" "}
              <code className="bg-black/20 px-1 rounded">http://localhost:3001</code>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-[#00FF80]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">With Push Token</p>
                <p className="text-3xl font-bold">{users.filter((u) => u.expoPushToken).length}</p>
              </div>
              <Bell className="w-10 h-10 text-[#3B82F6]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Selected</p>
                <p className="text-3xl font-bold">{isBroadcast ? "All" : selectedUsers.length}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-[#F59E0B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>Create and send push notifications to your users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={isBroadcast ? "success" : "outline"}
              onClick={() => setIsBroadcast(true)}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Broadcast to All
            </Button>
            <Button
              variant={!isBroadcast ? "success" : "outline"}
              onClick={() => setIsBroadcast(false)}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Select Users
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Notification message..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{content.length}/500 characters</p>
          </div>

          {!isBroadcast && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Select Recipients</label>
                <Button variant="ghost" size="sm" onClick={selectAllUsers}>
                  {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar border border-border rounded-lg p-2">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00FF80]" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users with push tokens found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        selectedUsers.includes(user.id)
                          ? "bg-[#00FF80]/20 border border-[#00FF80]"
                          : "bg-secondary/50 hover:bg-secondary"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          selectedUsers.includes(user.id)
                            ? "bg-[#00FF80] border-[#00FF80]"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedUsers.includes(user.id) && (
                          <CheckCircle2 className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <Button
            variant="success"
            className="w-full"
            onClick={handleSend}
            disabled={
              loading ||
              !title.trim() ||
              !content.trim() ||
              apiStatus === "offline" ||
              (!isBroadcast && selectedUsers.length === 0)
            }
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : apiStatus === "offline" ? (
              <>
                <Bell className="w-4 h-4 mr-2" />
                API Server Offline
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isBroadcast ? "Send to All Users" : `Send to ${selectedUsers.length} Users`}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


