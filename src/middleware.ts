import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedPaths = ["/settings", "/history"];
// Define routes that require *verified* authentication
const verifiedPaths = ["/settings", "/history"]; // Add paths requiring verification

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedPaths.some((prefix) =>
    path.startsWith(prefix)
  );
  const isVerifiedRoute = verifiedPaths.some((prefix) =>
    path.startsWith(prefix)
  );

  // Skip middleware if not a protected route
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Get the token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const loginUrl = new URL("/auth/login", request.url);

    // 1. Check for authentication
    if (!token) {
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Check for email verification if the route requires it
    if (isVerifiedRoute && !token.emailVerified) {
      // Redirect to the dedicated verification page
      const verifyUrl = new URL("/auth/verify-email", request.url);
      // Optionally add callbackUrl if they should return after verification
      // verifyUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(verifyUrl);
    }

    // User is authenticated (and verified if required), allow the request
    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // On error, redirect to home page or login page
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }
}

// Update matcher to include all paths checked by the middleware
export const config = {
  matcher: ["/settings/:path*", "/history/:path*"], // Use more specific matching if needed
};
