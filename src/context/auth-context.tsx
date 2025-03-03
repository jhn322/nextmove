"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Session } from "next-auth";
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  getAuthenticatedSupabaseClient,
  clearSupabaseClientCache,
} from "@/lib/supabase";
import { isSessionValid } from "@/lib/auth-service";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  supabaseClient: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the authenticated Supabase client based on the current session
  const supabaseClient = useMemo(() => {
    return getAuthenticatedSupabaseClient(session);
  }, [session]);

  // Protected routes
  const protectedRoutes = useMemo(() => ["/history", "/settings"], []);

  // Initialize session on mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Refresh session function
  const refreshSession = async (): Promise<Session | null> => {
    try {
      const updatedSession = await update();
      return updatedSession;
    } catch (error) {
      console.error("[AuthContext] Error refreshing session:", error);
      return null;
    }
  };

  // Check session validity and redirect if needed
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      // Only check on protected routes when authenticated
      if (
        status === "authenticated" &&
        session &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        // Check if session is valid
        if (!isSessionValid(session)) {
          console.log("[AuthContext] Session invalid, redirecting to sign in");
          await nextAuthSignOut({
            callbackUrl: window.location.origin,
            redirect: true,
          });
        }
      }
    };

    if (isInitialized) {
      checkSessionAndRedirect();
    }
  }, [status, session, pathname, isInitialized, protectedRoutes]);

  // Redirect from protected routes if unauthenticated
  useEffect(() => {
    if (
      status === "unauthenticated" &&
      isInitialized &&
      protectedRoutes.some((route) => pathname.startsWith(route))
    ) {
      router.push("/");
    }
  }, [status, pathname, router, isInitialized, protectedRoutes]);

  const handleSignIn = async (provider: string) => {
    try {
      // Use a consistent callback URL for production
      const callbackUrl =
        process.env.NODE_ENV === "production"
          ? "https://next-move-js.vercel.app"
          : typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      await nextAuthSignIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("[AuthContext] Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear any cached Supabase clients to ensure fresh authentication on next sign-in
      clearSupabaseClientCache();

      // Use a consistent callback URL for production
      const callbackUrl =
        process.env.NODE_ENV === "production"
          ? "https://next-move-js.vercel.app"
          : typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      await nextAuthSignOut({
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
    }
  };

  const value = {
    session,
    status,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshSession,
    supabaseClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
