import apiClient from "@/lib/api-client";
import type {
  GrowthActionItem,
  GrowthContentIntelligence,
  GrowthLead,
  GrowthOverview,
  GrowthRetention,
  GrowthSegment,
} from "@/types/admin-growth.types";

export const adminGrowthService = {
  async getOverview(): Promise<GrowthOverview> {
    const response = await apiClient.get<GrowthOverview>("/api/admin/growth/overview");
    return response.data;
  },

  async getSegments(): Promise<GrowthSegment[]> {
    const response = await apiClient.get<GrowthSegment[]>("/api/admin/growth/segments");
    return response.data;
  },

  async getLeads(): Promise<GrowthLead[]> {
    const response = await apiClient.get<GrowthLead[]>("/api/admin/growth/leads");
    return response.data;
  },

  async getRetention(): Promise<GrowthRetention> {
    const response = await apiClient.get<GrowthRetention>("/api/admin/growth/retention");
    return response.data;
  },

  async getContentIntelligence(): Promise<GrowthContentIntelligence> {
    const response = await apiClient.get<GrowthContentIntelligence>(
      "/api/admin/growth/content-intelligence"
    );
    return response.data;
  },

  async getActionCenter(): Promise<GrowthActionItem[]> {
    const response = await apiClient.get<GrowthActionItem[]>(
      "/api/admin/growth/action-center"
    );
    return response.data;
  },
};
