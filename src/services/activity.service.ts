import axios from 'axios';
import { config } from '../lib/config';

const getHeaders = () => ({
  'x-marketplace-key': config.marketplaceApiKey,
  'Content-Type': 'application/json',
});

export interface Activity {
  id: string;
  userId: string;
  type: 'quiz' | 'chat' | 'streak';
  title?: string;
  xpEarned: number;
  createdAt: string;
}

export const activityService = {
  async getAllActivities(): Promise<Activity[]> {
    try {
      const response = await axios.get(`${config.apiUrl}/activity`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  },

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    try {
      const response = await axios.get(`${config.apiUrl}/activity/user/${userId}`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
      throw error;
    }
  },
};

