import axios from 'axios';
import { config } from '../lib/config';

const getHeaders = () => ({
  'x-admin-key': config.adminApiKey,
  'Content-Type': 'application/json',
});

export interface NotificationResult {
  sent: number;
  failed: number;
}

export const notificationsService = {
  async broadcastNotification(title: string, content: string): Promise<NotificationResult> {
    const response = await axios.post(
      `${config.apiUrl}/admin/notifications/broadcast`,
      { title, content },
      { headers: getHeaders() }
    );
    return response.data;
  },

  async sendNotificationToUsers(userIds: string[], title: string, content: string): Promise<NotificationResult> {
    const response = await axios.post(
      `${config.apiUrl}/admin/notifications/send`,
      { userIds, title, content },
      { headers: getHeaders() }
    );
    return response.data;
  },
};


