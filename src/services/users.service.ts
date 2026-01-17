import axios from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  address?: string;
  xp: number;
  credits: string;
  streak: number;
  level: "novice" | "beginner" | "intermediate" | "advanced" | "expert";
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
    const response = await axios.get("/api/marketplace/auth/leaderboard");
    return response.data.users;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await axios.get(`/api/marketplace/auth/id/${userId}`);
    return response.data;
  },

  async searchUsers(username: string, limit = 10): Promise<User[]> {
    const response = await axios.get("/api/marketplace/auth/search", {
      params: { username, limit },
    });
    return response.data;
  },

  async updateUserLevel(userId: string, level: User["level"]): Promise<void> {
    await axios.put(`/api/marketplace/auth/level/${userId}`, { level });
  },
};
