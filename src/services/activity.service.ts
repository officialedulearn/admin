import axios from "axios";

export interface Activity {
  id: string;
  userId: string;
  type: "quiz" | "chat" | "streak";
  title?: string;
  xpEarned: number;
  createdAt: string;
}

export const activityService = {
  async getAllActivities(): Promise<Activity[]> {
    const response = await axios.get("/api/marketplace/activity");
    return response.data;
  },

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    const response = await axios.get(`/api/marketplace/activity/user/${userId}`);
    return response.data;
  },
};
