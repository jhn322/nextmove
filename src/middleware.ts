import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API, static files, and auth callback routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.includes("callback") ||
    pathname.startsWith("/pieces")
  ) {
    return NextResponse.next();
  }

  // Get session token
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    // Protected routes
    const protectedRoutes = ["/history", "/settings"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Redirect unauthenticated users back to home
    if (isProtectedRoute && !token) {
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users back to home
    if (pathname.startsWith("/auth/signin") && token) {
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error(`[Middleware] Error:`, error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
