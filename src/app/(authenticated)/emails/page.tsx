"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, User, Loader2, Eye, EyeOff, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  emailService,
  type EngagementTemplateId,
  type NftListingBroadcastPayload,
  type NftListingItemPayload,
} from "@/services/email.service";
import { adminService, type AdminUser } from "@/services/admin.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ENGAGEMENT_TEMPLATES: { id: EngagementTemplateId; label: string }[] = [
  { id: "come-back-soon", label: "Come Back Soon" },
  { id: "refer-friends", label: "Refer Friends, Earn Together" },
  { id: "streak-reminder", label: "Streak Reminder" },
  { id: "eddy-tip", label: "Eddy's Weekly Tip" },
  { id: "referral-superstar", label: "Referral Superstar" },
];

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
  const [testEmail, setTestEmail] = useState("");
  const [engagementTemplate, setEngagementTemplate] = useState<EngagementTemplateId>("come-back-soon");
  const [engagementPreviewHtml, setEngagementPreviewHtml] = useState<string | null>(null);
  const [engagementPreviewName, setEngagementPreviewName] = useState("Alex");
  const [engagementPreviewCode, setEngagementPreviewCode] = useState("ABC123");
  const [engagementPreviewCount, setEngagementPreviewCount] = useState(5);
  const [engagementTestEmail, setEngagementTestEmail] = useState("");
  const [engagementLoading, setEngagementLoading] = useState(false);
  const emptyNftItem = (): NftListingItemPayload => ({
    header: "",
    title: "",
    description: "",
    imageUrl: "",
  });
  const emptyNftListing = (): NftListingBroadcastPayload => ({
    subject: "",
    previewText: "",
    howToEarnText: "",
    nfts: [emptyNftItem()],
    ctaUrl: "",
    ctaLabel: "",
  });
  const [nftListing, setNftListing] = useState<NftListingBroadcastPayload>(emptyNftListing);
  const [nftListingPreviewHtml, setNftListingPreviewHtml] = useState<string | null>(null);
  const [nftListingTestEmail, setNftListingTestEmail] = useState("");
  const [nftListingLoading, setNftListingLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await emailService.getNftListingBroadcastConfig();
        setNftListing(cfg);
      } catch {
        /* ignore */
      }
    })();
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

      <Card className="border-[#00FF80]/30 bg-card/50">
        <CardHeader>
          <CardTitle className="text-[#00FF80]">🐸 Eddy Engagement Templates</CardTitle>
          <CardDescription>
            Pre-designed emails from Eddy to drive app opens. Preview, test, or broadcast to all.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template</label>
            <select
              value={engagementTemplate}
              onChange={(e) => {
                setEngagementTemplate(e.target.value as EngagementTemplateId);
                setEngagementPreviewHtml(null);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ENGAGEMENT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preview params (optional)</label>
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={engagementPreviewName}
                  onChange={(e) => setEngagementPreviewName(e.target.value)}
                />
                {(engagementTemplate === "refer-friends" || engagementTemplate === "referral-superstar") && (
                  <>
                    <Input
                      placeholder="Referral code"
                      value={engagementPreviewCode}
                      onChange={(e) => setEngagementPreviewCode(e.target.value)}
                    />
                    {engagementTemplate === "referral-superstar" && (
                      <Input
                        type="number"
                        placeholder="Referral count"
                        value={engagementPreviewCount}
                        onChange={(e) => setEngagementPreviewCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    setEngagementLoading(true);
                    const html = await emailService.getPreviewHtml(engagementTemplate, {
                      name: engagementPreviewName,
                      referralCode: engagementPreviewCode,
                      referralCount: engagementTemplate === "referral-superstar" ? engagementPreviewCount : undefined,
                    });
                    setEngagementPreviewHtml(html);
                  } catch (err) {
                    toast.error("Failed to load preview");
                    console.error(err);
                  } finally {
                    setEngagementLoading(false);
                  }
                }}
                disabled={engagementLoading}
              >
                {engagementLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                Preview
              </Button>
            </div>
          </div>
          {engagementPreviewHtml && (
            <div
              className="border border-border rounded-lg p-4 min-h-[200px] bg-white text-black overflow-auto max-h-[400px]"
              dangerouslySetInnerHTML={{ __html: engagementPreviewHtml }}
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              placeholder="Test email"
              value={engagementTestEmail}
              onChange={(e) => setEngagementTestEmail(e.target.value)}
              className="w-48"
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!engagementTestEmail.trim()) {
                  toast.error("Enter email for test");
                  return;
                }
                try {
                  setEngagementLoading(true);
                  await emailService.sendEngagementTest(engagementTemplate, engagementTestEmail.trim(), {
                    name: engagementPreviewName,
                    referralCode: engagementPreviewCode,
                    referralCount: engagementTemplate === "referral-superstar" ? engagementPreviewCount : undefined,
                  });
                  toast.success(`Test sent to ${engagementTestEmail}`);
                } catch (err) {
                  toast.error("Failed to send test");
                  console.error(err);
                } finally {
                  setEngagementLoading(false);
                }
              }}
              disabled={engagementLoading}
            >
              Send Test
            </Button>
            <Button
              variant="success"
              onClick={async () => {
                try {
                  setEngagementLoading(true);
                  const result = await emailService.sendEngagementBroadcast(engagementTemplate);
                  toast.success(`Broadcast sent! ${result.sent} delivered, ${result.failed} failed (Total: ${result.total ?? result.sent + result.failed})`);
                } catch (err) {
                  toast.error("Failed to broadcast");
                  console.error(err);
                } finally {
                  setEngagementLoading(false);
                }
              }}
              disabled={engagementLoading}
            >
              {engagementLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Broadcast to All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#00FF80]/30 bg-card/50">
        <CardHeader>
          <CardTitle className="text-[#00FF80]">🏆 New NFT listing broadcast</CardTitle>
          <CardDescription>
            Edit fields below (defaults load from{" "}
            <code className="text-xs">api/src/emails/nft-listing-announcement.config.ts</code>). Resend
            broadcast uses your audience; greeting uses{" "}
            <code className="text-xs">{"{{{FIRST_NAME}}}"}</code> when sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                value={nftListing.subject}
                onChange={(e) => setNftListing((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preview text (inbox snippet)</label>
              <Input
                value={nftListing.previewText}
                onChange={(e) => setNftListing((p) => ({ ...p, previewText: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">How to earn an NFT</label>
              <Textarea
                value={nftListing.howToEarnText}
                onChange={(e) => setNftListing((p) => ({ ...p, howToEarnText: e.target.value }))}
                className="min-h-[72px]"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">NFTs (image left, header + title + description)</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setNftListing((p) => ({ ...p, nfts: [...p.nfts, emptyNftItem()] }))
                }
              >
                Add NFT
              </Button>
            </div>
            {nftListing.nfts.map((nft, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border p-4 space-y-3 bg-secondary/30"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">NFT {idx + 1}</span>
                  {nftListing.nfts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-8"
                      onClick={() =>
                        setNftListing((p) => ({
                          ...p,
                          nfts: p.nfts.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Header</label>
                    <Input
                      value={nft.header}
                      onChange={(e) =>
                        setNftListing((p) => {
                          const nfts = [...p.nfts];
                          nfts[idx] = { ...nfts[idx], header: e.target.value };
                          return { ...p, nfts };
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Title</label>
                    <Input
                      value={nft.title}
                      onChange={(e) =>
                        setNftListing((p) => {
                          const nfts = [...p.nfts];
                          nfts[idx] = { ...nfts[idx], title: e.target.value };
                          return { ...p, nfts };
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Description</label>
                    <Textarea
                      value={nft.description}
                      onChange={(e) =>
                        setNftListing((p) => {
                          const nfts = [...p.nfts];
                          nfts[idx] = { ...nfts[idx], description: e.target.value };
                          return { ...p, nfts };
                        })
                      }
                      className="min-h-[72px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Image URL</label>
                    <Input
                      value={nft.imageUrl}
                      onChange={(e) =>
                        setNftListing((p) => {
                          const nfts = [...p.nfts];
                          nfts[idx] = { ...nfts[idx], imageUrl: e.target.value };
                          return { ...p, nfts };
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">CTA URL</label>
              <Input
                value={nftListing.ctaUrl}
                onChange={(e) => setNftListing((p) => ({ ...p, ctaUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CTA label</label>
              <Input
                value={nftListing.ctaLabel}
                onChange={(e) => setNftListing((p) => ({ ...p, ctaLabel: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setNftListingLoading(true);
                  const html = await emailService.getNftListingPreview(nftListing);
                  setNftListingPreviewHtml(html);
                } catch (err) {
                  toast.error("Failed to load preview");
                  console.error(err);
                } finally {
                  setNftListingLoading(false);
                }
              }}
              disabled={nftListingLoading}
            >
              {nftListingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
              Preview
            </Button>
            <Input
              type="email"
              placeholder="Test email"
              value={nftListingTestEmail}
              onChange={(e) => setNftListingTestEmail(e.target.value)}
              className="w-48"
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!nftListingTestEmail.trim()) {
                  toast.error("Enter email for test");
                  return;
                }
                try {
                  setNftListingLoading(true);
                  await emailService.sendNftListingTest(nftListingTestEmail.trim(), nftListing);
                  toast.success(`Test sent to ${nftListingTestEmail}`);
                } catch (err) {
                  toast.error("Failed to send test");
                  console.error(err);
                } finally {
                  setNftListingLoading(false);
                }
              }}
              disabled={nftListingLoading}
            >
              Send test
            </Button>
            <Button
              variant="success"
              onClick={async () => {
                try {
                  setNftListingLoading(true);
                  const result = await emailService.broadcastNftListing(nftListing);
                  toast.success(
                    `NFT listing broadcast queued. ~${result.sent} contacts (Total: ${result.total ?? result.sent})`
                  );
                } catch (err) {
                  toast.error("Failed to broadcast");
                  console.error(err);
                } finally {
                  setNftListingLoading(false);
                }
              }}
              disabled={nftListingLoading}
            >
              {nftListingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Broadcast (Resend)
            </Button>
          </div>
          {nftListingPreviewHtml && (
            <div
              className="border border-border rounded-lg p-4 min-h-[200px] bg-white text-black overflow-auto max-h-[480px]"
              dangerouslySetInnerHTML={{ __html: nftListingPreviewHtml }}
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-[#00FF80]/30 bg-card/50">
        <CardHeader>
          <CardTitle className="text-[#00FF80]">🎉 v2.5 Announcement Email</CardTitle>
          <CardDescription>Send the pre-designed v2.5 feature announcement to all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Your email for test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!testEmail.trim()) {
                  toast.error("Enter your email to send a test");
                  return;
                }
                try {
                  setLoading(true);
                  await emailService.sendV25AnnouncementTest(testEmail.trim());
                  toast.success(`Test email sent to ${testEmail}`);
                } catch (error) {
                  toast.error("Failed to send test email");
                  console.error(error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Test"}
            </Button>
          </div>
          <Button
            variant="success"
            className="w-full"
            onClick={async () => {
              if (loading) return;
              try {
                setLoading(true);
                const result = await emailService.sendV25Announcement();
                toast.success(`v2.5 Announcement sent! ${result.sent} delivered, ${result.failed} failed (Total: ${result.total})`);
              } catch (error) {
                toast.error("Failed to send v2.5 announcement");
                console.error(error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {loading ? "Sending..." : "Send v2.5 Announcement to All Users"}
          </Button>
        </CardContent>
      </Card>

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


