import axios from 'axios';
import { config } from '../lib/config';

const getHeaders = () => ({
  'x-marketplace-key': config.marketplaceApiKey,
  'Content-Type': 'application/json',
});

export interface Reward {
  id: string;
  type: 'certificate' | 'points';
  title: string;
  description: string;
  imageUrl?: string;
  ipfs?: string;
  createdAt: string;
}

export interface CreateRewardDto {
  type: 'certificate' | 'points';
  title: string;
  description: string;
  imageUrl?: string;
  ipfs?: string;
}

export const rewardsService = {
  async getAllRewards(): Promise<Reward[]> {
    try {
      const response = await axios.get(`${config.apiUrl}/rewards`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      throw error;
    }
  },

  async createReward(data: CreateRewardDto): Promise<Reward> {
    try {
      const response = await axios.post(`${config.apiUrl}/rewards`, data, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create reward:', error);
      throw error;
    }
  },

  async deleteReward(id: string): Promise<void> {
    try {
      await axios.delete(`${config.apiUrl}/rewards/${id}`, {
        headers: getHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete reward:', error);
      throw error;
    }
  },

  async awardRewardToUser(userId: string, rewardId: string): Promise<void> {
    try {
      await axios.post(
        `${config.apiUrl}/rewards/award`,
        { userId, rewardId },
        {
          headers: getHeaders(),
        }
      );
    } catch (error) {
      console.error('Failed to award reward:', error);
      throw error;
    }
  },

  async getRewardRecipients(rewardId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${config.apiUrl}/rewards/recipients/${rewardId}`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reward recipients:', error);
      throw error;
    }
  },
};

