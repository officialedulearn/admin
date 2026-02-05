import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>
) {
  const { path } = await params;
  const { apiUrl, marketplaceApiKey, adminApiKey } = getServerConfig();

  if (!marketplaceApiKey) {
    console.error("❌ MARKETPLACE_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Marketplace API key not configured. Please set MARKETPLACE_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const targetPath = path.join("/");
  const targetUrl = new URL(`/${targetPath}`, apiUrl);

  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-marketplace-key": marketplaceApiKey,
    "x-admin-key": adminApiKey,
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`🔗 Proxying ${request.method} ${targetUrl.pathname} to ${apiUrl}`);
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    } catch {
      // No body
    }
  }

  try {
    const startTime = Date.now();
    const response = await fetch(targetUrl.toString(), {
      ...fetchOptions,
      signal: AbortSignal.timeout(30000),
    });
    const duration = Date.now() - startTime;

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ ${request.method} ${targetUrl.pathname} - ${response.status} (${duration}ms)`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `API returned ${response.status}` };
      }
      
      if (response.status === 401) {
        console.error("❌ 401 Unauthorized - Check MARKETPLACE_API_KEY matches backend configuration");
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      console.error(`❌ Timeout connecting to ${apiUrl} - Is the API server running?`);
      return NextResponse.json(
        { 
          error: "Request timeout - API server took too long to respond",
          hint: `Check if API server is running at ${apiUrl}`
        },
        { status: 504 }
      );
    }
    
    if (error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED")) {
      console.error(`❌ Connection refused to ${apiUrl} - Is the API server running?`);
      return NextResponse.json(
        { 
          error: "Cannot connect to API server",
          hint: `Make sure the API server is running at ${apiUrl}`
        },
        { status: 502 }
      );
    }
    
    console.error("❌ API proxy error:", error.message);
    return NextResponse.json(
      { error: "Failed to connect to API server", details: error.message },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}
