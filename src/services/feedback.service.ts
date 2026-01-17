import axios from "axios";

export interface Feedback {
  id: string;
  userId: string;
  content: string;
  category?: "bug" | "feature" | "improvement" | "other";
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  user?: {
    name: string;
    email: string;
    username: string;
  };
}

export const feedbackService = {
  async getAllFeedback(): Promise<Feedback[]> {
    const response = await axios.get("/api/admin/feedback");
    return response.data;
  },

  async updateFeedbackStatus(
    id: string,
    status: "pending" | "reviewed" | "resolved"
  ): Promise<Feedback> {
    const response = await axios.put(`/api/admin/feedback/${id}/status`, {
      status,
    });
    return response.data;
  },
};
