import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";

interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
}

const sessionPassword = process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security";
const cookieName = "edulearn_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const sessionCookie = request.cookies.get(cookieName)?.value;
    
    let session: SessionData = { isAuthenticated: false };
    
    if (sessionCookie) {
      try {
        session = await unsealData<SessionData>(sessionCookie, {
          password: sessionPassword,
        });
      } catch (error) {
        console.error("Failed to decrypt session:", error);
        session = { isAuthenticated: false };
      }
    }

    if (pathname.startsWith("/login")) {
      if (session.isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (!session.isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    if (pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.otf).*)",
  ],
};
