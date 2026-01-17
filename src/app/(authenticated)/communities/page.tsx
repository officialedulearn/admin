"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  Globe,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  communityService,
  type Community,
  type CommunityWithMembers,
} from "@/services/community.service";

const DEFAULT_ADMIN_EMAIL = "ozerlihashem@gmail.com";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    inviteCode: "",
    visibility: "public" as "public" | "private",
    imageUrl: "",
    adminEmail: DEFAULT_ADMIN_EMAIL,
  });

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityService.getAllCommunities();
      setCommunities(data);
    } catch (error) {
      console.error("Failed to load communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!formData.title || !formData.inviteCode) return;

    try {
      setCreating(true);
      await communityService.createCommunity({
        ...formData,
        imageUrl: formData.imageUrl || undefined,
      });
      setDialogOpen(false);
      setFormData({
        title: "",
        inviteCode: "",
        visibility: "public",
        imageUrl: "",
        adminEmail: DEFAULT_ADMIN_EMAIL,
      });
      await loadCommunities();
    } catch (error: any) {
      console.error("Failed to create community:", error);
      alert(error.response?.data?.error || "Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    if (!confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(communityId);
      await communityService.deleteCommunity(communityId);
      await loadCommunities();
      if (selectedCommunity?.id === communityId) {
        setSelectedCommunity(null);
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete community:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDetails = async (communityId: string) => {
    try {
      const details = await communityService.getCommunityById(communityId);
      setSelectedCommunity(details);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Failed to load community details:", error);
    }
  };

  const generateInviteCode = () => {
    setFormData((prev) => ({
      ...prev,
      inviteCode: communityService.generateInviteCode(),
    }));
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
          <h1 className="text-3xl font-bold text-foreground mb-1">Communities</h1>
          <p className="text-muted-foreground">
            Manage and create communities for your platform
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00FF80] text-black hover:bg-[#00FF80]/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Create a new community with an admin user automatically assigned.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Community Title *</label>
                <Input
                  placeholder="Enter community name"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Invite Code *</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="ABCD1234"
                    value={formData.inviteCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        inviteCode: e.target.value.toUpperCase(),
                      }))
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateInviteCode}
                    className="shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.visibility === "public" ? "default" : "outline"}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, visibility: "public" }))
                    }
                    className={
                      formData.visibility === "public"
                        ? "bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
                        : ""
                    }
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Public
                  </Button>
                  <Button
                    type="button"
                    variant={formData.visibility === "private" ? "default" : "outline"}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, visibility: "private" }))
                    }
                    className={
                      formData.visibility === "private"
                        ? "bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
                        : ""
                    }
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Private
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (optional)</label>
                <Input
                  placeholder="https://example.com/image.png"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Username *</label>
                <Input
                  placeholder="Admin's username"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  This user will be automatically added as the community moderator
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCommunity}
                disabled={creating || !formData.title || !formData.inviteCode}
                className="bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Community
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Communities Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first community to get started
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-[#00FF80] text-black hover:bg-[#00FF80]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </CardContent>
          </Card>
        ) : (
          communities.map((community) => (
            <Card
              key={community.id}
              className="hover:border-[#00FF80]/50 transition-colors cursor-pointer"
              onClick={() => handleViewDetails(community.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {community.imageUrl ? (
                      <img
                        src={community.imageUrl}
                        alt={community.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#00FF80]" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{community.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {community.visibility === "public" ? (
                          <span className="flex items-center text-xs text-[#00FF80]">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-yellow-500">
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">
                      {community.inviteCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyInviteCode(community.inviteCode);
                      }}
                    >
                      {copiedCode === community.inviteCode ? (
                        <Check className="w-4 h-4 text-[#00FF80]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCommunity(community.id);
                    }}
                    disabled={deleting === community.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    {deleting === community.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Created {new Date(community.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCommunity?.imageUrl ? (
                <img
                  src={selectedCommunity.imageUrl}
                  alt={selectedCommunity.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#00FF80]" />
                </div>
              )}
              {selectedCommunity?.title}
            </DialogTitle>
            <DialogDescription>
              Community details and member information
            </DialogDescription>
          </DialogHeader>
          {selectedCommunity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium">
                      {selectedCommunity.inviteCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteCode(selectedCommunity.inviteCode)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedCode === selectedCommunity.inviteCode ? (
                        <Check className="w-3 h-3 text-[#00FF80]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Visibility</p>
                  <div className="flex items-center gap-1">
                    {selectedCommunity.visibility === "public" ? (
                      <>
                        <Globe className="w-4 h-4 text-[#00FF80]" />
                        <span className="text-sm font-medium">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Private</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members ({selectedCommunity.members?.length || 0})
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedCommunity.members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00FF80]/20 flex items-center justify-center">
                          <span className="text-[#00FF80] font-semibold text-sm">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{member.user.username}
                          </p>
                        </div>
                      </div>
                      {member.role === "mod" && (
                        <span className="flex items-center gap-1 text-xs bg-[#00FF80]/20 text-[#00FF80] px-2 py-1 rounded">
                          <Crown className="w-3 h-3" />
                          Moderator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCommunity) {
                  handleDeleteCommunity(selectedCommunity.id);
                }
              }}
              disabled={deleting === selectedCommunity?.id}
            >
              {deleting === selectedCommunity?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Community
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
