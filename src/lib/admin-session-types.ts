export type AdminRole = "admin" | "uploader";

export interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
  role?: AdminRole;
}
