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

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

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
      // Determine the callback URL based on environment
      const callbackUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NODE_ENV === "production"
          ? "https://next-move-js.vercel.app"
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
      // Determine the callback URL based on environment
      const callbackUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NODE_ENV === "production"
          ? "https://next-move-js.vercel.app"
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
