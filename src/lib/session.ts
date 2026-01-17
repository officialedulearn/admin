import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required. Generate a 32+ character random string."
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters long for security."
    );
  }

  return secret;
}

const sessionOptions = {
  password: getSessionSecret(),
  cookieName: "edulearn_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24,
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
