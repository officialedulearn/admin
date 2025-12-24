import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
}

// Session configuration
// Note: Use SESSION_SECRET (server-side only) for security
// NEXT_PUBLIC_ vars are exposed to client, so we prefer SESSION_SECRET
const sessionOptions = {
  password: process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security",
  cookieName: "edulearn_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession() {
  const session = await getSession();
  session.isAuthenticated = true;
  session.loginTime = Date.now();
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isAuthenticated === true;
}

