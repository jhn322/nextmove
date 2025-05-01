import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedPaths = ["/settings", "/history"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for non-protected paths
  if (!protectedPaths.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  try {
    // Get the token using the NEXTAUTH_SECRET
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If there's no token and we're on a protected route, redirect to sign in
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow the request
    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // On error, redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: ["/settings", "/history"],
};
