import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";

interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    return false;
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitMap.delete(ip);
    return false;
  }

  return entry.attempts >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { attempts: 1, firstAttempt: now });
  } else {
    entry.attempts++;
  }
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return secret;
}

const cookieName = "edulearn_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" && request.method === "POST") {
    const ip = getClientIP(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    recordAttempt(ip);
  }

  try {
    const sessionCookie = request.cookies.get(cookieName)?.value;
    let session: SessionData = { isAuthenticated: false };

    if (sessionCookie) {
      try {
        session = await unsealData<SessionData>(sessionCookie, {
          password: getSessionSecret(),
        });
      } catch {
        session = { isAuthenticated: false };
      }
    }

    if (pathname.startsWith("/login")) {
      if (session.isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/health")) {
      return NextResponse.next();
    }

    if (!session.isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.otf|api/health).*)",
  ],
};
