import axios from "axios";

export interface NotificationResult {
  sent: number;
  failed: number;
}

export const notificationsService = {
  async broadcastNotification(
    title: string,
    content: string
  ): Promise<NotificationResult> {
    try {
      const response = await axios.post(
        "/api/admin/notifications/broadcast",
        {
          title,
          content,
        },
        {
          timeout: 60000,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error(
          "Request timed out. The API server may be slow or not responding. Check if the API server is running."
        );
      }
      if (error.response?.status === 504) {
        throw new Error(
          "API server timeout. Make sure your API server is running at the configured URL."
        );
      }
      if (error.response?.status === 502) {
        throw new Error(
          "Cannot connect to API server. Check if the server is running and NEXT_PUBLIC_API_URL is correct."
        );
      }
      throw error;
    }
  },

  async sendNotificationToUsers(
    userIds: string[],
    title: string,
    content: string
  ): Promise<NotificationResult> {
    try {
      const response = await axios.post(
        "/api/admin/notifications/send",
        {
          userIds,
          title,
          content,
        },
        {
          timeout: 60000,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error(
          "Request timed out. The API server may be slow or not responding. Check if the API server is running."
        );
      }
      if (error.response?.status === 504) {
        throw new Error(
          "API server timeout. Make sure your API server is running at the configured URL."
        );
      }
      if (error.response?.status === 502) {
        throw new Error(
          "Cannot connect to API server. Check if the server is running and NEXT_PUBLIC_API_URL is correct."
        );
      }
      throw error;
    }
  },
};
