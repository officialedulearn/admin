import axios from 'axios';
import { config } from '../lib/config';

const getHeaders = () => {
  if (!config.marketplaceApiKey) {
    console.error('MARKETPLACE_API_KEY is not configured!');
  }
  return {
    'x-marketplace-key': config.marketplaceApiKey,
    'Content-Type': 'application/json',
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  address?: string;
  xp: number;
  credits: string;
  streak: number;
  level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  quizCompleted: number;
  isPremium: boolean;
  verified: boolean;
  referralCode?: string;
  referralCount?: number;
  learning?: string;
  lastLoggedIn: string;
  imageUploadLimit: number;
  quizLimits: number;
  totalEarnings: string;
}

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/leaderboard`, {
        headers: getHeaders(),
      });
      return response.data.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/id/${userId}`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  async searchUsers(username: string, limit = 10): Promise<User[]> {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/search`, {
        params: { username, limit },
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  },

  async updateUserLevel(userId: string, level: User['level']): Promise<void> {
    try {
      await axios.put(
        `${config.apiUrl}/auth/level/${userId}`,
        { level },
        { headers: getHeaders() }
      );
    } catch (error) {
      console.error('Failed to update user level:', error);
      throw error;
    }
  },
};

