"use client";

import React, { createContext, useContext } from "react";
import { Session } from "next-auth";
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider: string, callbackUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

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

  const handleSignIn = async (provider: string, callbackUrl?: string) => {
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXTAUTH_URL || "http://localhost:3000";

      await nextAuthSignIn(provider, {
        callbackUrl: callbackUrl || baseUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("[AuthContext] Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXTAUTH_URL || "http://localhost:3000";

      await nextAuthSignOut({
        callbackUrl: baseUrl,
        redirect: true,
      });

      router.push("/");
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
