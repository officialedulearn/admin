"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, User, Loader2, Eye, EyeOff, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { emailService } from "@/services/email.service";
import { adminService, type AdminUser } from "@/services/admin.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border border-border rounded-lg flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#00FF80]" />
    </div>
  ),
});

export default function EmailsPage() {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

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
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      toast.error("Please fill in both subject and email content");
      return;
    }

    if (!isBroadcast && selectedEmails.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    try {
      setLoading(true);
      let result;

      const wrappedHtml = wrapEmailTemplate(htmlContent);

      if (isBroadcast) {
        result = await emailService.broadcastEmail(subject, wrappedHtml);
      } else {
        result = await emailService.sendEmailToUsers(selectedEmails, subject, wrappedHtml);
      }

      toast.success(`Email sent! ${result.sent} delivered, ${result.failed} failed`);
      setSubject("");
      setHtmlContent("");
      setSelectedEmails([]);
    } catch (error) {
      toast.error("Failed to send email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const wrapEmailTemplate = (content: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0D0D0D;font-family:'Urbanist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#CCCCCC;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0D0D0D;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#151515;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background-color:#121212;padding:40px 30px;text-align:center;border-bottom:2px solid #00FF80;">
              <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:700;">EduLearn</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#121212;padding:30px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0 0 8px 0;color:#BFBFBF;font-size:14px;">Questions? Contact us at <a href="mailto:dave@edulearn.fun" style="color:#00FF80;text-decoration:none;">dave@edulearn.fun</a></p>
              <p style="margin:0;color:#9E9E9E;font-size:12px;">© 2025 EduLearn. Made with ❤️ for lifelong learners.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const toggleUserSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const selectAllUsers = () => {
    if (selectedEmails.length === filteredUsers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredUsers.map((u) => u.email));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Email Composer</h1>
        <p className="text-muted-foreground">Create and send emails to your users</p>
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
                <p className="text-sm text-muted-foreground mb-1">Recipients</p>
                <p className="text-3xl font-bold">{isBroadcast ? "All" : selectedEmails.length}</p>
              </div>
              <Mail className="w-10 h-10 text-[#3B82F6]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mode</p>
                <p className="text-xl font-bold">{isBroadcast ? "Broadcast" : "Selected"}</p>
              </div>
              <Send className="w-10 h-10 text-[#F59E0B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>Create a rich HTML email to send to your users</CardDescription>
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
              Select Recipients
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Email Content</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </div>
            {showPreview ? (
              <div
                className="border border-border rounded-lg p-4 min-h-[300px] bg-white text-black overflow-auto"
                dangerouslySetInnerHTML={{ __html: wrapEmailTemplate(htmlContent) }}
              />
            ) : (
              <TiptapEditor content={htmlContent} onChange={setHtmlContent} />
            )}
          </div>

          {!isBroadcast && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Select Recipients</label>
                <Button variant="ghost" size="sm" onClick={selectAllUsers}>
                  {selectedEmails.length === filteredUsers.length ? "Deselect All" : "Select All"}
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

              <div className="max-h-[250px] overflow-y-auto space-y-2 custom-scrollbar border border-border rounded-lg p-2">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00FF80]" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.email)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        selectedEmails.includes(user.email)
                          ? "bg-[#00FF80]/20 border border-[#00FF80]"
                          : "bg-secondary/50 hover:bg-secondary"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          selectedEmails.includes(user.email)
                            ? "bg-[#00FF80] border-[#00FF80]"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedEmails.includes(user.email) && (
                          <CheckCircle2 className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
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
            disabled={loading || !subject.trim() || !htmlContent.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {loading ? "Sending..." : isBroadcast ? "Send to All Users" : `Send to ${selectedEmails.length} Users`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


