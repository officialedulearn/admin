import axios from "axios";

export interface EmailResult {
  sent: number;
  failed: number;
}

export const emailService = {
  async broadcastEmail(
    subject: string,
    htmlContent: string
  ): Promise<EmailResult> {
    const response = await axios.post("/api/admin/emails/broadcast", {
      subject,
      htmlContent,
    });
    return response.data;
  },

  async sendEmailToUsers(
    emails: string[],
    subject: string,
    htmlContent: string
  ): Promise<EmailResult> {
    const response = await axios.post("/api/admin/emails/send", {
      emails,
      subject,
      htmlContent,
    });
    return response.data;
  },
};
