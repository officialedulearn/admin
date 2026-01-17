import axios from "axios";

export interface Community {
  id: string;
  title: string;
  inviteCode: string;
  visibility: "public" | "private";
  imageUrl: string | null;
  createdAt: string;
}

export interface CommunityMember {
  id: string;
  role: "mod" | "member";
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
}

export interface CommunityWithMembers extends Community {
  members: CommunityMember[];
}

export interface CreateCommunityData {
  title: string;
  inviteCode: string;
  visibility?: "public" | "private";
  imageUrl?: string;
  adminEmail: string;
}

export interface CreateCommunityResponse {
  community: Community;
  admin: {
    id: string;
    username: string;
    email: string;
  };
}

export const communityService = {
  async getAllCommunities(): Promise<Community[]> {
    const response = await axios.get("/api/admin/communities");
    return response.data;
  },

  async getCommunityById(communityId: string): Promise<CommunityWithMembers> {
    const response = await axios.get(`/api/admin/communities/${communityId}`);
    return response.data;
  },

  async createCommunity(data: CreateCommunityData): Promise<CreateCommunityResponse> {
    const response = await axios.post("/api/admin/communities", data);
    return response.data;
  },

  async deleteCommunity(communityId: string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/api/admin/communities/${communityId}`);
    return response.data;
  },

  generateInviteCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },
};
