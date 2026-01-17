import { NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";

export async function GET() {
  const { apiUrl } = getServerConfig();

  try {
    const response = await fetch(`${apiUrl}/admin/health`, {
      headers: {
        "x-admin-key": process.env.ADMIN_API_KEY || "",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "healthy",
        api: data,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        status: "degraded",
        api: { connected: false },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "down",
        api: { connected: false },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
