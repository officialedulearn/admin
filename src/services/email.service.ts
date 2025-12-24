import axios from 'axios';
import { config } from '../lib/config';

const getHeaders = () => ({
  'x-admin-key': config.adminApiKey,
  'Content-Type': 'application/json',
});

export interface EmailResult {
  sent: number;
  failed: number;
}

export const emailService = {
  async broadcastEmail(subject: string, htmlContent: string): Promise<EmailResult> {
    const response = await axios.post(
      `${config.apiUrl}/admin/emails/broadcast`,
      { subject, htmlContent },
      { headers: getHeaders() }
    );
    return response.data;
  },

  async sendEmailToUsers(emails: string[], subject: string, htmlContent: string): Promise<EmailResult> {
    const response = await axios.post(
      `${config.apiUrl}/admin/emails/send`,
      { emails, subject, htmlContent },
      { headers: getHeaders() }
    );
    return response.data;
  },
};


