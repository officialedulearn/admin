"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Award, Upload, Loader2, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { rewardsService, type Reward, type CreateRewardDto } from "@/services/rewards.service";
import { pinataService } from "@/services/pinata.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);

  const [formData, setFormData] = useState<CreateRewardDto>({
    type: "certificate",
    title: "",
    description: "",
    imageUrl: "",
    ipfs: "",
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await rewardsService.getAllRewards();
      setRewards(data);
    } catch (error) {
      toast.error("Failed to load rewards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rewardsService.createReward(formData);
      toast.success("Reward created successfully!");
      setFormData({
        type: "certificate",
        title: "",
        description: "",
        imageUrl: "",
        ipfs: "",
      });
      setShowCreateForm(false);
      loadRewards();
    } catch (error) {
      toast.error("Failed to create reward");
      console.error(error);
    }
  };

  const handleUploadMetadata = async () => {
    if (!formData.title || !formData.description || !formData.imageUrl) {
      toast.error("Please fill in all fields before uploading metadata");
      return;
    }

    try {
      setUploadingMetadata(true);
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: formData.imageUrl,
        attributes: [{ trait_type: "Type", value: formData.type }],
      };

      const { url } = await pinataService.uploadJSON(metadata);
      setFormData({ ...formData, ipfs: url });
      toast.success("Metadata uploaded to IPFS successfully!");
    } catch (error) {
      toast.error("Failed to upload metadata to IPFS");
      console.error(error);
    } finally {
      setUploadingMetadata(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;

    try {
      await rewardsService.deleteReward(id);
      toast.success("Reward deleted successfully!");
      loadRewards();
    } catch (error) {
      toast.error("Failed to delete reward");
      console.error(error);
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
          <h1 className="text-3xl font-bold text-foreground mb-1">Rewards Management</h1>
          <p className="text-muted-foreground">Create and manage platform rewards</p>
        </div>
        <Button variant="success" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-5 h-5" />
          Create Reward
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
                <p className="text-3xl font-bold">{rewards.length}</p>
              </div>
              <Award className="w-10 h-10 text-[#00FF80]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Certificates</p>
                <p className="text-3xl font-bold">{rewards.filter((r) => r.type === "certificate").length}</p>
              </div>
              <Award className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Points Rewards</p>
                <p className="text-3xl font-bold">{rewards.filter((r) => r.type === "points").length}</p>
              </div>
              <Award className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "certificate" | "points" })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FF80]"
                >
                  <option value="certificate">Certificate</option>
                  <option value="points">Points</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter reward title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter reward description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">IPFS Metadata URL</label>
                  <Button type="button" variant="outline" onClick={handleUploadMetadata} disabled={uploadingMetadata}>
                    {uploadingMetadata ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload to IPFS
                  </Button>
                </div>
                <Input
                  type="url"
                  value={formData.ipfs || ""}
                  onChange={(e) => setFormData({ ...formData, ipfs: e.target.value })}
                  placeholder="ipfs://... or https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="success" className="flex-1">
                  Create Reward
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            {reward.imageUrl ? (
              <div className="relative h-48 bg-secondary">
                <img src={reward.imageUrl} alt={reward.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="relative h-48 bg-secondary flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reward.type === "certificate" ? "bg-[#00FF80]/20 text-[#00FF80]" : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {reward.type}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2">{reward.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{reward.description}</p>

              {reward.ipfs && <p className="text-xs text-muted-foreground mb-4 truncate">IPFS: {reward.ipfs}</p>}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{new Date(reward.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDeleteReward(reward.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No rewards yet. Create your first reward!</p>
        </div>
      )}
    </div>
  );
}


