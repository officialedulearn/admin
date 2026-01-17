import axios from "axios";

export interface Reward {
  id: string;
  type: "certificate" | "points";
  title: string;
  description: string;
  imageUrl?: string;
  ipfs?: string;
  createdAt: string;
}

export interface CreateRewardDto {
  type: "certificate" | "points";
  title: string;
  description: string;
  imageUrl?: string;
  ipfs?: string;
}

export const rewardsService = {
  async getAllRewards(): Promise<Reward[]> {
    try {
      const response = await axios.get("/api/marketplace/rewards", {
        timeout: 10000,
      });
      return response.data || [];
    } catch (error: any) {
      console.error("Failed to fetch rewards:", error);
      if (error.response?.status === 404 || error.response?.status === 502) {
        return [];
      }
      throw error;
    }
  },

  async createReward(data: CreateRewardDto): Promise<Reward> {
    const response = await axios.post("/api/marketplace/rewards", data);
    return response.data;
  },

  async deleteReward(id: string): Promise<void> {
    await axios.delete(`/api/marketplace/rewards/${id}`);
  },

  async awardRewardToUser(userId: string, rewardId: string): Promise<void> {
    await axios.post("/api/marketplace/rewards/award", { userId, rewardId });
  },

  async getRewardRecipients(rewardId: string): Promise<unknown[]> {
    const response = await axios.get(
      `/api/marketplace/rewards/recipients/${rewardId}`
    );
    return response.data;
  },
};
