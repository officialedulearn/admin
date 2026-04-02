import axios from "axios";

export interface EmailResult {
  sent: number;
  failed: number;
  total?: number;
}

export type NftListingItemPayload = {
  header: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type NftListingBroadcastPayload = {
  subject: string;
  previewText: string;
  howToEarnText: string;
  nfts: NftListingItemPayload[];
  ctaUrl: string;
  ctaLabel: string;
};

export type EngagementTemplateId =
  | "come-back-soon"
  | "refer-friends"
  | "streak-reminder"
  | "eddy-tip"
  | "referral-superstar";

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

  async sendV25Announcement(): Promise<EmailResult> {
    const response = await axios.post("/api/admin/emails/v25-announcement");
    return response.data;
  },

  async sendV25AnnouncementTest(
    email: string,
    name?: string
  ): Promise<{ sent: boolean }> {
    const response = await axios.post(
      "/api/admin/emails/v25-announcement/test",
      { email, name }
    );
    return response.data;
  },

  async getPreviewHtml(
    template: EngagementTemplateId,
    params?: { name?: string; referralCode?: string; referralCount?: number }
  ): Promise<string> {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.set("name", params.name);
    if (params?.referralCode) searchParams.set("referralCode", params.referralCode);
    if (params?.referralCount != null) searchParams.set("referralCount", String(params.referralCount));
    const query = searchParams.toString();
    const url = `/api/admin/emails/preview/${template}${query ? `?${query}` : ""}`;
    const response = await axios.get<{ html: string }>(url);
    return response.data.html;
  },

  async sendEngagementBroadcast(
    template: EngagementTemplateId
  ): Promise<EmailResult> {
    const response = await axios.post(
      `/api/admin/emails/engagement/${template}/broadcast`
    );
    return response.data;
  },

  async sendEngagementTest(
    template: EngagementTemplateId,
    email: string,
    params?: { name?: string; referralCode?: string; referralCount?: number }
  ): Promise<{ sent: boolean }> {
    const response = await axios.post(
      `/api/admin/emails/engagement/${template}/test`,
      { email, ...params }
    );
    return response.data;
  },

  async getNftListingBroadcastConfig(): Promise<NftListingBroadcastPayload> {
    const response = await axios.get<NftListingBroadcastPayload>(
      "/api/admin/emails/nft-listing/config"
    );
    return response.data;
  },

  async getNftListingPreview(
    payload: Partial<NftListingBroadcastPayload>
  ): Promise<string> {
    const response = await axios.post<{ html: string }>(
      "/api/admin/emails/nft-listing/preview",
      payload
    );
    return response.data.html;
  },

  async sendNftListingTest(
    email: string,
    payload: Partial<NftListingBroadcastPayload>
  ): Promise<{ sent: boolean }> {
    const response = await axios.post("/api/admin/emails/nft-listing/test", {
      email,
      ...payload,
    });
    return response.data;
  },

  async broadcastNftListing(
    payload?: Partial<NftListingBroadcastPayload>
  ): Promise<EmailResult> {
    const response = await axios.post(
      "/api/admin/emails/nft-listing/broadcast",
      payload ?? {}
    );
    return response.data;
  },
};
