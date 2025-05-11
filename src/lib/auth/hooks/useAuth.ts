"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AUTH_ROUTES, UserRole } from "@/lib/auth/constants/auth";

interface UseAuthProps {
  role?: UserRole | UserRole[];
}

/* Hook to fetch session status and optionally handle role-based redirection on the client. */
export const useAuth = ({ role }: UseAuthProps = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";
  const authenticated = status === "authenticated";
  const unauthenticated = status === "unauthenticated";

  useEffect(() => {
    if (loading) return; // Do nothing while the session is loading

    // Check role permission if specified (kept for client-side control)
    if (role && authenticated) {
      const userRole = session?.user?.role as UserRole;
      const hasAccess = Array.isArray(role)
        ? role.includes(userRole)
        : userRole === role;

      if (!hasAccess) {
        // If the user is logged in but has the wrong role, send to the unauthorized page
        router.push(AUTH_ROUTES.UNAUTHORIZED);
      }
    }
  }, [loading, authenticated, role, session?.user?.role, router]);

  return { session, status, loading, authenticated, unauthenticated };
};
