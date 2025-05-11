import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { AUTH_ROUTES, UserRole } from "@/lib/auth/constants/auth";
import { hasRequiredRole } from "./auth";

/**
 * Fetches active session on the server-side
 */
export const getSession = async () => {
  return await getServerSession(authOptions);
};

/**
 * Checks if the user has the correct role (server-side).
 * Redirects to the unauthorized page if the role is incorrect.
 * Used AFTER middleware has ensured login.
 */
export const requireRole = async (
  requiredRole: UserRole | UserRole[],
  unauthorizedUrl = AUTH_ROUTES.UNAUTHORIZED
) => {
  const session = await getSession(); // Fetch session directly

  // If no session exists (should not happen due to middleware, but as a precaution)
  // or if the user lacks a role
  if (!session?.user?.role) {
    console.error("requireRole: User lacks session or role.");
    redirect(AUTH_ROUTES.LOGIN); // Send to login if something is wrong
    return null; // Return null to avoid TS errors below
  }

  const userRole = session.user.role as UserRole;

  if (!hasRequiredRole(userRole, requiredRole)) {
    redirect(unauthorizedUrl);
  }

  // Return the session so it can be used on the page if the check passes
  return session;
};
